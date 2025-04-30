import bgImage from '../assets/landing-bg.jpg';
import logo from '../assets/conversia-lg.png';
import Wallet from '../components/Wallet';

const LandingPage: React.FC = () => {
  return (
    <div
      className="h-screen flex items-center justify-center bg-cover bg-center text-white"
      style={{ backgroundImage: `url(${bgImage})` }}
    >

     <div className="flex flex-col items-center">
      <img
        src={logo}
        alt="Conversia Logo"
        className="w-82 h-32 mb-6" 
      />
      <Wallet/>
    </div>
   </div>
  );
};

export default LandingPage;
