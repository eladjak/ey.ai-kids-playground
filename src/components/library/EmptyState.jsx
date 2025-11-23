
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";

export default function EmptyState({ title, description, icon, actionLabel, actionLink }) {
  return (
    <Card className="bg-gray-50 dark:bg-gray-800/50 border-dashed">
      <CardContent className="p-8 md:p-12 text-center">
        {icon}
        <h3 className="text-xl font-medium mb-2">{title}</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          {description}
        </p>
        {actionLabel && actionLink && (
          <Link to={actionLink}>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <PlusCircle className="h-4 w-4 mr-2" />
              {actionLabel}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
