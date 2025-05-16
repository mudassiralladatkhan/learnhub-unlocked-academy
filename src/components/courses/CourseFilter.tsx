
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

type CourseFilterProps = {
  categories: string[];
  instructors: string[];
};

export function CourseFilter({ categories, instructors }: CourseFilterProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    instructor: searchParams.get('instructor') || 'all',
    difficulty: searchParams.get('difficulty') || 'all',
  });

  // For mobile filter modal
  const [tempFilters, setTempFilters] = useState({ ...filters });
  const [isOpen, setIsOpen] = useState(false);
  
  // Update URL search params when filters change
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    
    if (filters.search) newSearchParams.set('search', filters.search);
    if (filters.category !== 'all') newSearchParams.set('category', filters.category);
    if (filters.instructor !== 'all') newSearchParams.set('instructor', filters.instructor);
    if (filters.difficulty !== 'all') newSearchParams.set('difficulty', filters.difficulty);
    
    setSearchParams(newSearchParams);
  }, [filters, setSearchParams]);
  
  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: tempFilters.search }));
    if (isMobile) setIsOpen(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handleFilterChange = (key: string, value: string) => {
    if (isMobile) {
      setTempFilters(prev => ({ ...prev, [key]: value }));
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };
  
  const applyFilters = () => {
    setFilters(tempFilters);
    setIsOpen(false);
  };
  
  const resetFilters = () => {
    const newFilters = {
      search: '',
      category: 'all',
      instructor: 'all',
      difficulty: 'all',
    };
    
    if (isMobile) {
      setTempFilters(newFilters);
    } else {
      setFilters(newFilters);
      setSearchParams(new URLSearchParams());
    }
  };
  
  // Initialize tempFilters when mobile filter modal opens
  useEffect(() => {
    if (isOpen) {
      setTempFilters({ ...filters });
    }
  }, [isOpen, filters]);
  
  return (
    <div className="w-full space-y-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search courses..."
            className="pl-10"
            value={isMobile ? tempFilters.search : filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        {isMobile ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal size={18} />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Filter Courses</SheetTitle>
                <SheetDescription>
                  Apply filters to narrow down course results
                </SheetDescription>
              </SheetHeader>
              
              <div className="py-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="category-mobile">Category</Label>
                  <Select 
                    value={tempFilters.category} 
                    onValueChange={(value) => handleFilterChange('category', value)}
                  >
                    <SelectTrigger id="category-mobile">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category.toLowerCase()}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instructor-mobile">Instructor</Label>
                  <Select 
                    value={tempFilters.instructor} 
                    onValueChange={(value) => handleFilterChange('instructor', value)}
                  >
                    <SelectTrigger id="instructor-mobile">
                      <SelectValue placeholder="All Instructors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Instructors</SelectItem>
                      {instructors.map((instructor) => (
                        <SelectItem key={instructor} value={instructor}>
                          {instructor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="difficulty-mobile">Difficulty</Label>
                  <Select 
                    value={tempFilters.difficulty} 
                    onValueChange={(value) => handleFilterChange('difficulty', value)}
                  >
                    <SelectTrigger id="difficulty-mobile">
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <SheetFooter className="flex flex-row gap-2 sm:flex-row">
                <Button variant="outline" className="flex-1" onClick={resetFilters}>Reset</Button>
                <Button className="flex-1" onClick={applyFilters}>Apply Filters</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        ) : (
          <Button variant="default" onClick={handleSearch}>
            Search
          </Button>
        )}
      </div>
      
      {/* Desktop filters */}
      {!isMobile && (
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="category" className="min-w-[80px]">Category:</Label>
            <Select 
              value={filters.category} 
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger id="category" className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase()}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="instructor" className="min-w-[80px]">Instructor:</Label>
            <Select 
              value={filters.instructor} 
              onValueChange={(value) => handleFilterChange('instructor', value)}
            >
              <SelectTrigger id="instructor" className="w-[180px]">
                <SelectValue placeholder="All Instructors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Instructors</SelectItem>
                {instructors.map((instructor) => (
                  <SelectItem key={instructor} value={instructor}>
                    {instructor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="difficulty" className="min-w-[80px]">Difficulty:</Label>
            <Select 
              value={filters.difficulty} 
              onValueChange={(value) => handleFilterChange('difficulty', value)}
            >
              <SelectTrigger id="difficulty" className="w-[180px]">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {(filters.category !== 'all' || filters.instructor !== 'all' || filters.difficulty !== 'all' || filters.search) && (
            <Button variant="ghost" onClick={resetFilters} className="ml-auto">
              Reset Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
