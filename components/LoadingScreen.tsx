import React from 'react';
import { APP_LOGO } from '../constants';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 via-indigo-50 to-blue-100 overflow-hidden">
      <div className="relative">
        {/* Círculos decorativos animados */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-32 h-32 rounded-full border-4 border-violet-300 border-t-violet-600 animate-spin"></div>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-40 h-40 rounded-full border-4 border-blue-200 border-b-blue-500 animate-spin-slow"></div>
        </div>
        
        {/* Logo com animação */}
        <div className="relative z-10 flex flex-col items-center animate-pulse-slow">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
            <img 
              src={APP_LOGO} 
              alt="Logo Finanças$imples" 
              className="w-24 h-24 object-contain drop-shadow-lg animate-bounce-slow"
            />
          </div>
          <div className="mt-6 text-center">
            <h1 className="text-3xl font-bold bg-clip-text text-green-600">
              Finanças<span className="font-light text-gray-600">$imples</span>
            </h1>
            <p className="text-sm text-gray-500 mt-2 animate-pulse">Carregando...</p>
          </div>
        </div>
        
        {/* Efeitos de brilho */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-violet-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float-delayed"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
