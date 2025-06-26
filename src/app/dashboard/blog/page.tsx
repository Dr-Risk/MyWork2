
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
    title: "The Digital Stethoscope: A Revolution in Remote Auscultation",
    category: "Technology",
    excerpt: "Discover how digital stethoscopes are transforming telemedicine, allowing for high-fidelity heart and lung sound analysis from miles away.",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "digital stethoscope",
  },
  {
    id: 4,
    title: "Mental Health First Aid for Medical Professionals",
    category: "Wellness",
    excerpt: "Learn to recognize signs of mental distress in colleagues and patients, and provide initial support with this essential guide.",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "doctor support",
  },
  {
    id: 5,
    title: "Surgical Robotics: Precision and the Future of the OR",
    category: "Surgery",
    excerpt: "An inside look at how robotic-assisted surgery is improving patient outcomes, reducing recovery times, and changing the face of modern operations.",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "robotic surgery",
  },
  {
    id: 6,
    title: "Genomic Medicine: Tailoring Treatments to DNA",
    category: "Genetics",
    excerpt: "Explore the cutting edge of personalized medicine, where treatments are designed based on an individual's unique genetic makeup.",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "dna sequence",
  },
   {
    id: 7,
    title: "Navigating Ethical Dilemmas in the ICU",
    category: "Ethics",
    excerpt: "A framework for making difficult decisions in critical care, balancing patient autonomy, beneficence, and justice in high-stakes scenarios.",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "hospital discussion",
  },
  {
    id: 8,
    title: "The Gut-Brain Axis: A New Frontier in Neurology",
    category: "Neurology",
    excerpt: "Scientists are uncovering the profound connection between gut health and neurological disorders. Here's what you need to know.",
    image: "https://placehold.co/600x400.png",
    dataAiHint: "brain anatomy",
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
              <p className="text-sm text-muted-foreground">{post.excerpt}</p>
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
