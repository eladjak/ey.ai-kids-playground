import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Book } from "@/entities/Book";
import { User } from "@/entities/User";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function ShareBookModal({ isOpen, onClose, onShare }) {
  const [isLoading, setIsLoading] = useState(true);
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      loadUserBooks();
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (selectedBook) {
      const bookObject = books.find(book => book.id === selectedBook);
      if (bookObject) {
        // Set default title based on book
        setTitle(`Check out my book: ${bookObject.title}`);
        
        // Set default tags based on book genre
        if (bookObject.genre) {
          setTags([bookObject.genre.replace(/_/g, ' ')]);
        }
      }
    }
  }, [selectedBook]);
  
  const loadUserBooks = async () => {
    try {
      setIsLoading(true);
      const userBooks = await Book.list("-created_date");
      setBooks(userBooks);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading books:", error);
      setIsLoading(false);
    }
  };
  
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    // Check if tag already exists
    if (!tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
    }
    
    // Reset input
    setTagInput('');
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleSubmit = () => {
    if (!selectedBook || !title.trim() || !description.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    const formData = {
      bookId: selectedBook,
      title: title.trim(),
      description: description.trim(),
      tags: tags
    };
    
    onShare(formData);
    resetForm();
  };
  
  const resetForm = () => {
    setSelectedBook(null);
    setTitle('');
    setDescription('');
    setTags([]);
    setTagInput('');
    setIsSubmitting(false);
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  // Suggested tags
  const suggestedTags = [
    "adventure", "fantasy", "education", "animals", "family", 
    "friendship", "science", "values", "learning", "fun"
  ].filter(tag => !tags.includes(tag));
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Share Your Book</DialogTitle>
          <DialogDescription>
            Share your book with the community and inspire others
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="book-select" className="block mb-2">
              Select a book to share
            </Label>
            <Select value={selectedBook} onValueChange={setSelectedBook}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a book..." />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>Loading books...</SelectItem>
                ) : books.length > 0 ? (
                  books.map(book => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.title}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>No books found</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="title" className="block mb-2">
              Post Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a title"
            />
          </div>
          
          <div>
            <Label htmlFor="description" className="block mb-2">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell the community about this book and why you created it..."
              className="min-h-[120px]"
            />
          </div>
          
          <div>
            <Label className="block mb-2">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map(tag => (
                <Badge 
                  key={tag}
                  variant="secondary"
                  className="pl-2 flex items-center gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                >
                  {tag}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 w-5 p-0 rounded-full text-purple-700 hover:text-purple-900 hover:bg-purple-200 dark:text-purple-300 dark:hover:bg-purple-800"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button 
                variant="outline" 
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                Add
              </Button>
            </div>
            
            {suggestedTags.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Suggested tags:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.slice(0, 5).map(tag => (
                    <Badge 
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      onClick={() => {
                        setTags([...tags, tag]);
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedBook || !title.trim() || !description.trim() || isSubmitting}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? 'Sharing...' : 'Share Book'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}