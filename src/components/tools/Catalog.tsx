import React, { useState, useMemo } from 'react';
import { NEURAL_NETWORKS, NeuralNetworkType } from '../../config/neuralNetworks';
import { Sparkles, Globe, Lock, ImageIcon, Video, FileText } from 'lucide-react';

interface CatalogProps {
}

export const Catalog: React.FC<CatalogProps> = () => {
  const [typeFilter, setTypeFilter] = useState<NeuralNetworkType | 'all'>('all');
  const [vpnFilter, setVpnFilter] = useState<'all' | 'vpn' | 'no-vpn'>('all');

  const filtered = useMemo(() => {
    return NEURAL_NETWORKS.filter(nn => {
      const typeMatch = typeFilter === 'all' || nn.type === typeFilter;
      const vpnMatch = vpnFilter === 'all' || 
                       (vpnFilter === 'vpn' && nn.needsVpn) || 
                       (vpnFilter === 'no-vpn' && !nn.needsVpn);
      return typeMatch && vpnMatch;
    });
  }, [typeFilter, vpnFilter]);

  const getTypeIcon = (type: NeuralNetworkType) => {
    switch (type) {
      case 'text': return <FileText size={16} />;
      case 'image': return <ImageIcon size={16} />;
      case 'video': return <Video size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {(['all', 'text', 'image', 'video'] as const).map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize ${typeFilter === t ? 'bg-white shadow-sm' : 'text-gray-600'}`}>
              {t === 'all' ? 'Все' : t === 'text' ? 'Текст' : t === 'image' ? 'Картинки' : 'Видео'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="vpn" checked={vpnFilter === 'no-vpn'} onChange={() => setVpnFilter('no-vpn')} /> 
            <span className="text-sm">Без VPN</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="vpn" checked={vpnFilter === 'vpn'} onChange={() => setVpnFilter('vpn')} /> 
            <span className="text-sm">VPN</span>
          </label>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(nn => (
          <div key={nn.id} className="border border-gray-200 rounded-xl p-4 hover:border-cyan-300 transition-all flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-gray-900">
                {getTypeIcon(nn.type)}
                {nn.name}
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${nn.needsVpn ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                {nn.needsVpn ? 'VPN' : 'Без VPN'}
              </span>
            </div>
            <p className="text-sm text-gray-600 flex-1">{nn.description}</p>
            <div className="flex gap-2 pt-2">
              <a href={nn.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold bg-gray-900 text-white px-3 py-2 rounded-lg flex-1 text-center">Перейти</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
