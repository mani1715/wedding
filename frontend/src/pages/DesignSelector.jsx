import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Crown, Flower2, Heart, Film, Scroll, Palette, Globe } from 'lucide-react';

export const DesignSelector = () => {
  const navigate = useNavigate();
  const [hoveredDesign, setHoveredDesign] = useState(null);

  const designs = [
    {
      id: 'temple',
      name: 'Traditional South Indian Temple',
      description: 'Sacred temple aesthetics with saffron and gold',
      icon: Sparkles,
      color: 'temple',
      gradient: 'from-orange-300 via-amber-200 to-yellow-100'
    },
    {
      id: 'royal',
      name: 'Royal Classic Indian',
      description: 'Regal purple and magenta with golden accents',
      icon: Crown,
      color: 'royal',
      gradient: 'from-purple-300 via-pink-200 to-amber-100'
    },
    {
      id: 'floral',
      name: 'Floral Elegance',
      description: 'Soft pastels with botanical beauty',
      icon: Flower2,
      color: 'floral',
      gradient: 'from-rose-200 via-pink-100 to-green-100'
    },
    {
      id: 'divine',
      name: 'Divine Minimal',
      description: 'Clean, spiritual, and modern',
      icon: Heart,
      color: 'divine',
      gradient: 'from-amber-50 via-white to-gray-50'
    },
    {
      id: 'cinematic',
      name: 'Cinematic',
      description: 'Bold and dramatic with video-like feel',
      icon: Film,
      color: 'cinematic',
      gradient: 'from-slate-700 via-amber-400 to-red-400'
    },
    {
      id: 'scroll',
      name: 'Classic Scroll',
      description: 'Vintage parchment paper invitation',
      icon: Scroll,
      color: 'scroll',
      gradient: 'from-amber-200 via-orange-100 to-yellow-50'
    },
    {
      id: 'art',
      name: 'Cultural Art',
      description: 'Hand-painted traditional art style',
      icon: Palette,
      color: 'art',
      gradient: 'from-red-300 via-teal-200 to-purple-200'
    },
    {
      id: 'modern',
      name: 'Universal Modern',
      description: 'Contemporary and inclusive design',
      icon: Globe,
      color: 'modern',
      gradient: 'from-blue-200 via-cyan-100 to-pink-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="font-elegant text-5xl md:text-6xl font-bold text-gray-800 mb-4">
            Choose Your Wedding Invitation Design
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Select a design style that reflects your special celebration
          </p>
        </div>

        {/* Design Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {designs.map((design, index) => {
            const Icon = design.icon;
            return (
              <Card
                key={design.id}
                className="group relative overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
                onMouseEnter={() => setHoveredDesign(design.id)}
                onMouseLeave={() => setHoveredDesign(null)}
                onClick={() => navigate(`/invitation/${design.id}`)}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${design.gradient} opacity-70 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Content */}
                <div className="relative p-6 h-full flex flex-col">
                  <div className="flex-1">
                    <div className="mb-4">
                      <Icon className="w-10 h-10 text-gray-700 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className="font-elegant text-xl font-semibold text-gray-800 mb-2">
                      {design.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {design.description}
                    </p>
                  </div>
                  
                  <Button
                    variant="outline"
                    className={`mt-4 w-full bg-white/80 hover:bg-white transition-all duration-300 ${
                      hoveredDesign === design.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}
                  >
                    View Design
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Bottom Info */}
        <div className="mt-12 text-center text-gray-600 animate-fade-in">
          <p className="text-sm">
            Each design can be customized with optional spiritual themes or kept universal
          </p>
        </div>
      </div>
    </div>
  );
};

export default DesignSelector;
