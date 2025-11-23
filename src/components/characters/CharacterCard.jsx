import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { createPageUrl } from '@/utils';
import { User } from 'lucide-react';

export default function CharacterCard({ character }) {
    return (
        <Link to={`${createPageUrl('CharacterEditor')}?id=${character.id}`}>
            <Card className="hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200 h-full flex flex-col">
                <CardHeader className="flex-row items-center gap-4 p-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={character.primary_image_url} alt={character.name} />
                        <AvatarFallback className="bg-gray-200 dark:bg-gray-700">
                             <User className="h-8 w-8 text-gray-500" />
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <CardTitle>{character.name}</CardTitle>
                        <CardDescription>{character.age ? `${character.age} years old` : ''}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                        {character.personality}
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
}