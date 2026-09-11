import Link from "next/link";
import { Compass, Home, Map } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 shadow-sm mb-6">
        <Compass className="h-10 w-10 animate-spin" style={{ animationDuration: "12s" }} />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
        404 • High Mountain Pass Not Found
      </span>

      <h1 className="mt-3 text-3xl sm:text-5xl font-black font-serif text-stone-900">
        Off the Beaten Path
      </h1>

      <p className="mt-3 max-w-md text-sm text-stone-600">
        It seems you took an unmarked trail. The summit or itinerary you are searching for might have
        been relocated, or seasonal snow has closed the pass.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 font-bold">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" /> Return to Basecamp
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/treks">
            <Map className="mr-2 h-4 w-4" /> Explore All Treks
          </Link>
        </Button>
      </div>
    </div>
  );
}
