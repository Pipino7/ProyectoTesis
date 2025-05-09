import { useNavigate } from 'react-router-dom';

const useLogout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    
  
    window.dispatchEvent(new Event('storage'));
    

    setTimeout(() => {
      navigate('/login');
    }, 100);
  };

  return handleLogout;
};

export default useLogout;
