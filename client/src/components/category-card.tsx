import { useLanguage } from "@/lib/language-context";
import { Link } from "wouter";
import { Code, Package, Gamepad2, UserCircle, LucideIcon, ArrowUpRight } from "lucide-react";
import type { Category } from "@shared/schema";

const iconMap: Record<string, LucideIcon> = {
  code: Code,
  package: Package,
  gamepad: Gamepad2,
  user: UserCircle,
};

const gradientColors: Record<string, { bg: string; border: string; icon: string }> = {
  code: { 
    bg: "from-blue-500/20 via-cyan-500/10 to-transparent", 
    border: "from-blue-500/50 via-cyan-500/30 to-transparent",
    icon: "text-blue-400"
  },
  package: { 
    bg: "from-purple-500/20 via-pink-500/10 to-transparent", 
    border: "from-purple-500/50 via-pink-500/30 to-transparent",
    icon: "text-purple-400"
  },
  gamepad: { 
    bg: "from-green-500/20 via-emerald-500/10 to-transparent", 
    border: "from-green-500/50 via-emerald-500/30 to-transparent",
    icon: "text-green-400"
  },
  user: { 
    bg: "from-orange-500/20 via-amber-500/10 to-transparent", 
    border: "from-orange-500/50 via-amber-500/30 to-transparent",
    icon: "text-orange-400"
  },
};

interface CategoryCardProps {
  category: Category;
  productCount?: number;
}

export function CategoryCard({ category, productCount = 0 }: CategoryCardProps) {
  const { language } = useLanguage();
  
  const name = language === "ar" ? category.nameAr : category.nameEn;
  const Icon = iconMap[category.icon || "package"] || Package;
  const colors = gradientColors[category.icon || "package"] || gradientColors.package;

  return (
    <Link href={`/category/${category.slug}`}>
      <div 
        className="group relative cursor-pointer"
        data-testid={`card-category-${category.slug}`}
      >
        {/* Gradient border effect */}
        <div className={`absolute -inset-[1px] bg-gradient-to-br ${colors.border} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[1px]`} />
        
        {/* Card container */}
        <div className="relative bg-zinc-900/90 backdrop-blur-sm rounded-2xl p-6 border border-zinc-800/50 group-hover:border-transparent transition-all duration-300 overflow-hidden">
          {/* Background glow */}
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.bg} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
          
          {/* Content */}
          <div className="relative flex flex-col items-center text-center gap-4">
            {/* Icon container */}
            <div className={`relative h-16 w-16 rounded-2xl bg-zinc-800/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <Icon className={`h-7 w-7 ${colors.icon} relative z-10`} />
            </div>
            
            {/* Text */}
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors duration-300">{name}</h3>
              <p className="text-sm text-zinc-500">
                {productCount} {language === "ar" ? "منتج" : "products"}
              </p>
            </div>
            
            {/* Arrow indicator */}
            <div className="absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0">
              <ArrowUpRight className={`h-5 w-5 ${colors.icon}`} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
