import { FC } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { House, MagnifyingGlass, ArrowLeft } from "@phosphor-icons/react"

const NotFound: FC = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Decorative element */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
            <div className="relative bg-card border border-border rounded-full p-8 shadow-lg">
              <svg
                className="w-24 h-24 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Error code */}
        <div className="mb-6">
          <h1 className="text-8xl md:text-9xl font-serif font-light text-foreground tracking-tight mb-2">404</h1>
          <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>

        {/* Error message */}
        <h2 className="text-3xl md:text-4xl font-serif font-light text-foreground mb-4 text-balance">Page Not Found</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto text-pretty leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="min-w-[160px]">
            <Link to="/" className="flex items-center gap-2">
              <House className="w-4 h-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-w-[160px] bg-transparent">
            <Link to="/?tab=bills" className="flex items-center gap-2">
              <MagnifyingGlass className="w-4 h-4" />
              Search Bills
            </Link>
          </Button>
        </div>

        {/* Back link */}
        <div className="mt-12">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back to previous page
          </Button>
        </div>

        {/* Decorative bottom element */}
        <div className="mt-16 flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary/30" />
          <div className="w-2 h-2 rounded-full bg-primary/50" />
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  )
}

export default NotFound
