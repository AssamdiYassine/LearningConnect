import { SessionWithDetails } from "@shared/schema";
import SessionItem from "@/components/session-item";

interface UpcomingSessionsProps {
  sessions: SessionWithDetails[];
}

export default function UpcomingSessions({ sessions }: UpcomingSessionsProps) {
  // Sort sessions by date (closest first)
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="px-6 py-4 divide-y divide-gray-200">
      {sortedSessions.map((session) => (
        <SessionItem key={session.id} session={session} />
      ))}
      
      <div className="pt-4 pb-2">
        <a href="/schedule" className="text-sm font-medium text-primary-600 hover:text-primary-500">
          View all my sessions <svg className="inline-block ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </a>
      </div>
    </div>
  );
}
