import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, CheckCircle } from "lucide-react";

export default function BookCoverPreview({ book }) {
  return (
    <div className="flex justify-center">
      <div className="text-center">
        <div className="mb-4 inline-flex items-center justify-center rounded-full bg-green-100 p-2 text-green-600 dark:bg-green-900/30 dark:text-green-400">
          <CheckCircle className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Your book is ready!
        </h3>
        
        <Card className="overflow-hidden shadow-xl max-w-xs mx-auto transition-transform hover:scale-105">
          <div className="aspect-[3/4] relative">
            {book.cover_image ? (
              <img 
                src={book.cover_image} 
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
          <CardContent className="p-4 text-center bg-white dark:bg-gray-800">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{book.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              A personalized story for {book.child_name}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}