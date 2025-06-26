import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const recommendedPosts = [
  {
    id: 1,
    title: "AI in Diagnostics: The Future is Now",
    category: "Technology",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "medical technology",
  },
  {
    id: 2,
    title: "Managing Burnout in Healthcare",
    category: "Wellness",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "doctor relaxing",
  },
];

const allPosts = [
  {
    id: 3,
    title: "Navigating Pediatric Care Challenges",
    category: "Pediatrics",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "child doctor",
  },
  {
    id: 4,
    title: "Breakthroughs in Cardiology",
    category: "Cardiology",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "heart surgery",
  },
  {
    id: 5,
    title: "The Role of Nutrition in Patient Recovery",
    category: "Nutrition",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "healthy food",
  },
  {
    id: 6,
    title: "Telemedicine Best Practices",
    category: "Technology",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "online consultation",
  },
];

export default function BlogPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">
          Recommended For You
        </h1>
        <p className="text-muted-foreground">
          AI-powered suggestions based on your profile and tasks.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {recommendedPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden group">
            <div className="overflow-hidden">
              <Image
                src={post.image}
                alt={post.title}
                width={600}
                height={400}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                data-ai-hint={post.dataAiHint}
              />
            </div>
            <CardHeader>
              <Badge variant="secondary" className="w-fit mb-2">
                {post.category}
              </Badge>
              <CardTitle className="font-headline">{post.title}</CardTitle>
            </CardHeader>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Read More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-3xl font-headline font-bold tracking-tight">
          All Posts
        </h2>
        <p className="text-muted-foreground">
          Browse the latest articles and insights.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allPosts.map((post) => (
          <Card key={post.id} className="flex flex-col overflow-hidden group">
            <div className="overflow-hidden">
              <Image
                src={post.image}
                alt={post.title}
                width={600}
                height={400}
                className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                data-ai-hint={post.dataAiHint}
              />
            </div>
            <CardHeader>
              <Badge variant="secondary" className="w-fit mb-2">
                {post.category}
              </Badge>
              <CardTitle className="font-headline">{post.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">A brief excerpt about the blog post would appear here, giving users a glimpse of the content.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Read More <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
