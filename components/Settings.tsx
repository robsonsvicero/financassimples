import React, { useState, useRef } from 'react';
import { User } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faSave, faUpload, faMagnifyingGlassPlus, faMagnifyingGlassMinus, faXmark, faCheck } from '@fortawesome/free-solid-svg-icons';

interface SettingsProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
  onRecalculateDueDates?: () => Promise<void>;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser, onRecalculateDueDates }) => {
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [tempImage, setTempImage] = useState('');
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [saved, setSaved] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      onUpdateUser({ ...user, name, avatar: avatarUrl });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleRecalculate = async () => {
    if (!onRecalculateDueDates) return;
    
    const confirmed = window.confirm(
      'Isso irá recalcular as datas de vencimento de todas as transações de crédito baseado no dia de fechamento dos cartões. Deseja continuar?'
    );
    
    if (confirmed) {
      setIsRecalculating(true);
      try {
        await onRecalculateDueDates();
        alert('Datas recalculadas com sucesso!');
      } catch (error) {
        alert('Erro ao recalcular datas');
        console.error(error);
      } finally {
        setIsRecalculating(false);
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setTempImage(reader.result);
          setZoom(1);
          setPosition({ x: 0, y: 0 });
          setShowImageEditor(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleSaveImage = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Define o tamanho do canvas (circular de 300x300)
    canvas.width = 300;
    canvas.height = 300;
    
    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Cria um clipping circular
    ctx.beginPath();
    ctx.arc(150, 150, 150, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    
    // Calcula as dimensões da imagem com zoom
    const scaledWidth = image.naturalWidth * zoom;
    const scaledHeight = image.naturalHeight * zoom;
    
    // Centraliza a imagem e aplica a posição
    const x = (canvas.width - scaledWidth) / 2 + position.x;
    const y = (canvas.height - scaledHeight) / 2 + position.y;
    
    // Desenha a imagem
    ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
    
    // Converte para base64
    const croppedImage = canvas.toDataURL('image/png');
    setAvatarUrl(croppedImage);
    setShowImageEditor(false);
  };

  const handleCancelEdit = () => {
    setShowImageEditor(false);
    setTempImage('');
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
       <h2 className="text-2xl font-bold text-gray-800">Configurações da Conta</h2>
       
       {/* Modal do Editor de Imagem */}
       {showImageEditor && (
         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4">
             <div className="flex justify-between items-center">
               <h3 className="text-xl font-bold text-gray-800">Ajustar Foto</h3>
               <button onClick={handleCancelEdit} className="p-2 hover:bg-gray-100 rounded-lg">
                 <FontAwesomeIcon icon={faXmark} />
               </button>
             </div>
             
             <div className="space-y-4">
               {/* Área de Preview */}
               <div 
                 className="relative w-full h-80 bg-gray-100 rounded-xl overflow-hidden cursor-move touch-none"
                 onMouseDown={handleMouseDown}
                 onMouseMove={handleMouseMove}
                 onMouseUp={handleMouseUp}
                 onMouseLeave={handleMouseUp}
                 onTouchStart={handleTouchStart}
                 onTouchMove={handleTouchMove}
                 onTouchEnd={handleTouchEnd}
               >
                 {/* Círculo de corte */}
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <div className="w-64 h-64 rounded-full border-4 border-white shadow-lg"></div>
                 </div>
                 
                 {/* Imagem */}
                 <div className="absolute inset-0 flex items-center justify-center">
                   <img
                     ref={imageRef}
                     src={tempImage}
                     alt="Preview"
                     className="max-w-none select-none"
                     draggable={false}
                     style={{
                       transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                       transition: isDragging ? 'none' : 'transform 0.1s'
                     }}
                   />
                 </div>
               </div>
               
               {/* Controles de Zoom */}
               <div className="space-y-2">
                 <label className="block text-sm font-medium text-gray-700">Zoom</label>
                 <div className="flex items-center gap-3">
                   <button
                     onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                     className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                   >
                     <FontAwesomeIcon icon={faMagnifyingGlassMinus} />
                   </button>
                   <input
                     type="range"
                     min="0.5"
                     max="3"
                     step="0.1"
                     value={zoom}
                     onChange={(e) => setZoom(parseFloat(e.target.value))}
                     className="flex-1"
                   />
                   <button
                     onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                     className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
                   >
                     <FontAwesomeIcon icon={faMagnifyingGlassPlus} />
                   </button>
                   <span className="text-sm text-gray-600 min-w-[50px]">{Math.round(zoom * 100)}%</span>
                 </div>
               </div>
               
               <p className="text-sm text-gray-500 text-center">
                 Arraste a imagem para posicioná-la
               </p>
             </div>
             
             {/* Botões de Ação */}
             <div className="flex gap-3 pt-4 border-t">
               <button
                 onClick={handleCancelEdit}
                 className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
               >
                 Cancelar
               </button>
               <button
                 onClick={handleSaveImage}
                 className="flex-1 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"
               >
                 <FontAwesomeIcon icon={faCheck} />
                 Confirmar
               </button>
             </div>
           </div>
         </div>
       )}
       
       {/* Canvas oculto para processar a imagem */}
       <canvas ref={canvasRef} style={{ display: 'none' }} />
       
       <div className="glass-card p-8 rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
             <div className="flex flex-col items-center mb-6">
                <div 
                  className="relative group cursor-pointer"
                  onClick={triggerFileInput}
                >
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-violet-100 border-4 border-white shadow-lg relative flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="w-full h-full object-contain bg-white" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-violet-400 text-4xl font-bold">
                        {name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <FontAwesomeIcon icon={faCamera} className="text-white text-3xl" />
                  </div>
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileChange}
                />
                
                <button 
                  type="button"
                  onClick={triggerFileInput}
                  className="mt-3 text-sm text-violet-600 font-medium cursor-pointer hover:text-violet-800 flex items-center gap-2 bg-transparent border-none"
                >
                  <FontAwesomeIcon icon={faUpload} />
                  Carregar nova foto
                </button>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Nome de Exibição</label>
               <input 
                 type="text" 
                 value={name} 
                 onChange={(e) => setName(e.target.value)}
                 className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:ring-2 focus:ring-violet-500 outline-none text-gray-800" 
               />
             </div>
             
             <div className="pt-4 border-t border-gray-100">
               <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-all">
                  <FontAwesomeIcon icon={faSave} />
                  Salvar Alterações
               </button>
               
               {saved && (
                 <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm text-center animate-fade-in">
                   ✓ Alterações salvas com sucesso!
                 </div>
               )}
             </div>
          </form>
       </div>

       {onRecalculateDueDates && (
         <div className="glass-card p-8 rounded-3xl mt-6">
           <h3 className="text-lg font-semibold text-gray-800 mb-4">Manutenção de Dados</h3>
           <p className="text-sm text-gray-600 mb-4">
             Recalcula as datas de vencimento das faturas de crédito com base no dia de fechamento correto (compras no dia do fechamento ou depois vão para o próximo mês).
           </p>
           <button
             onClick={handleRecalculate}
             disabled={isRecalculating}
             className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
           >
             {isRecalculating ? 'Recalculando...' : 'Recalcular Datas de Vencimento'}
           </button>
         </div>
       )}
    </div>
  );
};

export default Settings;