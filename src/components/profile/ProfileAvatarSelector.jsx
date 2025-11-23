import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// מערך של אווטארים מובנים לבחירה
const DEFAULT_AVATARS = [
  {
    id: "avatar1",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=Felix",
    alt: "Robot Avatar 1"
  },
  {
    id: "avatar2",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=Dusty",
    alt: "Robot Avatar 2"
  },
  {
    id: "avatar3",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=Coco",
    alt: "Robot Avatar 3"
  },
  {
    id: "avatar4",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=Zoe",
    alt: "Robot Avatar 4"
  },
  {
    id: "avatar5",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=Mittens",
    alt: "Robot Avatar 5"
  },
  {
    id: "avatar6",
    url: "https://api.dicebear.com/7.x/bottts/svg?seed=Oscar",
    alt: "Robot Avatar 6"
  },
  {
    id: "avatar7",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
    alt: "Adventurer Avatar 1"
  },
  {
    id: "avatar8",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Dusty",
    alt: "Adventurer Avatar 2"
  },
  {
    id: "avatar9",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Coco",
    alt: "Adventurer Avatar 3"
  },
  {
    id: "avatar10",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe",
    alt: "Adventurer Avatar 4"
  },
  {
    id: "avatar11",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Mittens",
    alt: "Adventurer Avatar 5"
  },
  {
    id: "avatar12",
    url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Oscar",
    alt: "Adventurer Avatar 6"
  }
];

// מערך דוגמה של דמויות מספרים שהמשתמש יצר
const STORY_CHARACTERS = [
  {
    id: "character1",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
    alt: "Luna Character",
    name: "Luna",
    book: "Space Adventures"
  },
  {
    id: "character2",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
    alt: "Max Character",
    name: "Max",
    book: "Deep Sea Explorers"
  },
  {
    id: "character3",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aria",
    alt: "Aria Character",
    name: "Aria",
    book: "Magical Forest"
  },
  {
    id: "character4",
    url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Leo",
    alt: "Leo Character",
    name: "Leo",
    book: "Safari Adventure"
  }
];

export default function ProfileAvatarSelector({ currentAvatar, onSelect }) {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(false);
  
  // פונקציה המדמה טעינה של דמויות מספרים
  const handleTabChange = (value) => {
    if (value === "characters") {
      setIsLoadingCharacters(true);
      setTimeout(() => {
        setIsLoadingCharacters(false);
      }, 1000);
    }
  };
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="default" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="default">Default Avatars</TabsTrigger>
          <TabsTrigger value="characters">Story Characters</TabsTrigger>
        </TabsList>
        
        <TabsContent value="default" className="pt-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {DEFAULT_AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                className={`p-2 rounded-lg transition-all ${
                  selectedAvatar === avatar.url 
                    ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => setSelectedAvatar(avatar.url)}
              >
                <Avatar className="h-16 w-16 mx-auto">
                  <AvatarImage src={avatar.url} alt={avatar.alt} />
                  <AvatarFallback>...</AvatarFallback>
                </Avatar>
              </button>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="characters" className="pt-4">
          {isLoadingCharacters ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STORY_CHARACTERS.map((character) => (
                <button
                  key={character.id}
                  className={`p-2 rounded-lg transition-all ${
                    selectedAvatar === character.url 
                      ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20" 
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  onClick={() => setSelectedAvatar(character.url)}
                >
                  <Avatar className="h-16 w-16 mx-auto">
                    <AvatarImage src={character.url} alt={character.alt} />
                    <AvatarFallback>{character.name[0]}</AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium text-center mt-2">
                    {character.name}
                  </p>
                  <p className="text-xs text-gray-500 text-center">
                    {character.book}
                  </p>
                </button>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="pt-4 flex justify-end">
        <Button 
          disabled={!selectedAvatar || selectedAvatar === currentAvatar}
          onClick={() => onSelect(selectedAvatar)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Apply Avatar
        </Button>
      </div>
    </div>
  );
}