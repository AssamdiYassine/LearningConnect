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
    <div className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:border-indigo-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative" style={{ paddingBottom: "56.25%" }}>
        <img 
          className="absolute h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#1D2B6C]/90 to-transparent"></div>
        
        {/* Badge flottant de catégorie - design moderne */}
        <div className="absolute top-3 left-3">
          <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-gray-800 rounded-full px-3 font-medium">
            {category}
          </Badge>
          {isNew && (
            <Badge className="ml-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white border-0 rounded-full px-3 font-medium">
              Nouveau 🔥
            </Badge>
          )}
        </div>
        
        {/* Badge d'accès par abonnement */}
        <div className="absolute top-3 right-3">
          {isFree ? (
            <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white border-0 rounded-full px-3 shadow-md font-medium">
              GRATUIT
            </Badge>
          ) : (
            <Badge className="bg-gradient-to-r from-[#7A6CFF] to-[#5F8BFF] text-white border-0 rounded-full px-3 shadow-md font-medium">
              Abonnement
            </Badge>
          )}
        </div>
      </div>
      
      <div className="p-5">
        <Link href={`/course/${id}`}>
          <h3 className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-[#7A6CFF] transition-colors duration-200 line-clamp-2 min-h-[3.5rem]">{title}</h3>
        </Link>
        
        <div className="flex flex-wrap gap-2 mt-3 items-center">
          <Badge variant="outline" className={`rounded-full px-3 ${getLevelBadgeColor(level)}`}>
            {getLevelText(level)}
          </Badge>
          
          <Badge variant="outline" className="rounded-full px-3 bg-indigo-50 text-indigo-700 border-indigo-200">
            <Users className="inline mr-1 h-3 w-3" />
            {students}
          </Badge>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-gradient-to-r from-[#5F8BFF] to-[#7A6CFF] flex items-center justify-center text-white text-xs font-bold">
              {instructor.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700">{instructor}</span>
          </div>
          
          <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="ml-1 text-xs font-semibold text-yellow-700">{rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}