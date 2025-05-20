import { Link } from "wouter";
import { Star, Users, SignalHigh } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SimpleCourseCardProps {
  id: number;
  title: string;
  description: string;
  level: string;
  price: number;
  imageUrl: string;
  category: string;
  instructor: string;
  rating: number;
  students: number;
  isNew?: boolean;
  isFree?: boolean;
}

export default function SimpleCourseCard({ 
  id, 
  title, 
  description, 
  level, 
  price, 
  imageUrl, 
  category,
  instructor,
  rating,
  students,
  isNew = false,
  isFree = false
}: SimpleCourseCardProps) {
  
  // Helper pour obtenir la couleur du badge de niveau
  const getLevelBadgeColor = (level: string) => {
    switch(level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Helper pour le texte du niveau
  const getLevelText = (level: string) => {
    switch(level) {
      case 'beginner':
        return 'Débutant';
      case 'intermediate':
        return 'Intermédiaire';
      case 'advanced':
        return 'Avancé';
      default:
        return 'Tous niveaux';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow duration-300">
      <div className="relative" style={{ paddingBottom: "56.25%" }}>
        <img 
          className="absolute h-full w-full object-cover" 
          src={imageUrl || `https://images.unsplash.com/photo-${id % 5 === 0 
            ? "1573164713988-8665fc963095" 
            : id % 4 === 0 
              ? "1581472723648-909f4851d4ae" 
              : id % 3 === 0 
                ? "1555949963-ff9fe0c870eb" 
                : id % 2 === 0 
                  ? "1576267423445-b2e0074d68a4" 
                  : "1551434678-e076c223a692"}?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80`}
          alt={title} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black opacity-60"></div>
        <div className="absolute bottom-0 left-0 p-4">
          <Badge variant="outline" className="bg-white/90 text-gray-800">
            {category}
          </Badge>
          {isNew && (
            <Badge className="ml-2 bg-red-500 text-white">Nouveau</Badge>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <Link href={`/course/${id}`}>
          <h3 className="text-lg font-medium text-gray-900 cursor-pointer hover:text-primary-600 line-clamp-2 min-h-[3.5rem]">{title}</h3>
        </Link>
        
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <span>{instructor}</span>
        </div>
        
        <div className="mt-2 flex items-center text-sm text-gray-500">
          <SignalHigh className="mr-1.5 h-4 w-4 text-gray-400" />
          <span className="capitalize">{getLevelText(level)}</span>
        </div>
        
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center">
            {/* Rating stars */}
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`w-3 h-3 ${star <= Math.round(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`} 
                />
              ))}
            </div>
            <span className="ml-1 text-xs text-gray-500">({rating.toFixed(1)})</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Users className="mr-1 h-3 w-3" />
            <span>{students} étudiants</span>
          </div>
        </div>
        
        {/* Prix */}
        <div className="mt-3 flex items-center justify-between">
          {isFree ? (
            <span className="text-base font-bold text-green-600">GRATUIT</span>
          ) : (
            <span className="text-base font-bold text-primary-900">{price} €</span>
          )}
        </div>
      </div>
    </div>
  );
}