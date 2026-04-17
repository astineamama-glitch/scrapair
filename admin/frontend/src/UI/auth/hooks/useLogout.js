import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../../api';

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = () => {
    authAPI.logout();
    navigate('/login');
  };

  return { logout };
};
