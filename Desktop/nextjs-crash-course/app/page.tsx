import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import {getAllEvents} from "@/lib/actions/event.actions";
import {cacheLife} from "next/cache";

const Page = async () => {
    'use cache';
    cacheLife('hours');

    const events = await getAllEvents();
    
    return (
        <section>
            <h1 className="">
                The Hub for Every Student <br/>
                Event You Can't Miss.
            </h1>
            <p className="text-center mt-5">Hackathons, Meetups, and Conferences, All in One Place </p>

            <ExploreBtn/>

            <div className="mt-20 space-y-7">
                <h3>Featured Events</h3>
                <ul className="events">
                    {events && events.length > 0 && events.map((event) => (
                        <li key={event.title} className="list-none">
                            <EventCard {...event} />
                        </li>

                    ))}
                </ul>
            </div>
        </section>
    )
}
export default Page
