import apiClient from './api';

const imageService = {
  // Upload image
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/images/upload', formData);
    return response.data;
  },

  // Delete image
  deleteImage: async (imageUrl) => {
    const encodedUrl = encodeURIComponent(imageUrl);
    const response = await apiClient.delete(`/images/${encodedUrl}`);
    return response.data;
  },

  // Compress image locally before upload
  compressImage: async (file, maxWidth = 1920, maxHeight = 1920, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Upload with compression
  uploadCompressedImage: async (file) => {
    try {
      const compressedBlob = await imageService.compressImage(file);
      const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });
      return await imageService.uploadImage(compressedFile);
    } catch (error) {
      // Fallback to original file
      return await imageService.uploadImage(file);
    }
  },
};

export default imageService;

