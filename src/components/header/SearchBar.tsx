import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, X, BookOpen, BookText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSearch } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Custom hooks
  const debouncedQuery = useDebounce(searchQuery, 300);
  const { results, loading, searchContent } = useSearch();
  
  // Handle outside clicks to close search results
  useOnClickOutside(searchRef, () => setIsOpen(false));
  
  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      searchContent(debouncedQuery);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [debouncedQuery, searchContent]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 0) {
      setIsOpen(true);
    }
  };
  
  const handleResultClick = (url: string) => {
    navigate(url);
    setSearchQuery('');
    setIsOpen(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };
  
  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative flex items-center">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search courses, lessons..."
          className="pl-10 pr-10 py-2 w-full"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchQuery && setIsOpen(true)}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-popover shadow-lg rounded-md border border-border py-2 z-50">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="px-4 py-2 text-xs font-medium text-muted-foreground">
                Search Results
              </div>
              <ul>
                {results.map((result) => (
                  <li key={`${result.type}-${result.id}`}>
                    <button
                      onClick={() => handleResultClick(result.url)}
                      className="flex items-start gap-3 w-full px-3 py-2 hover:bg-accent text-left"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {result.type === 'course' ? (
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <BookText className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{result.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {result.type === 'course' ? result.category : 'Lesson'}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="px-3 pt-2 pb-1 mt-1 border-t border-border">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-xs justify-start text-muted-foreground"
                  onClick={() => {
                    navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
                    setIsOpen(false);
                  }}
                >
                  View all results for "{searchQuery}"
                </Button>
              </div>
            </>
          ) : debouncedQuery ? (
            <div className="text-center py-8 px-4 text-muted-foreground">
              No results found for "{debouncedQuery}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
