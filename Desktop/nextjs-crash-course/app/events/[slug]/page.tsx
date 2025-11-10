import {notFound} from "next/navigation";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import {getSimilarEventsBySlug, getEventBySlug} from "@/lib/actions/event.actions";
import EventCard from "@/components/EventCard";
import { Suspense } from "react";

const EventDetailItem = ({icon, alt, label}: {icon: string; alt: string; label:string;}) => (
    <div className="flex-row-gap-2 items-center">
        <Image src={icon} alt={alt} width={17} height={17}/>
        <p>{label}</p>
    </div>

)

const EventAgenda = ({agendaItems}:{agendaItems:string[]})=> (
    <div className="agenda">
        <h2>Agenda</h2>
        <ul>
            {agendaItems.map((item)=>(
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
)

const EventTags = ({tags}: {tags:string[]})=> (
    <div className="flex flex-row gap-1.5 flex-wrap">
        {tags.map((tag)=>(
            <div className="pill" key={tag}>{tag}</div>
        ))}

    </div>
)

const EventContent = async ({slug}: {slug: string}) => {
    const event = await getEventBySlug(slug);

    if (!event) {
         return notFound();
    }

    const { description, image, overview, date, time, location, mode, agenda, audience, tags, organizer } = event;

    const bookings = 10;

    const similarEvents = await getSimilarEventsBySlug(slug);

    return (
        <>
            <div className="header">
                <h1>Event Description</h1>
                <p>{description}</p>
            </div>

            <div className="details">
                {/* Left Side - Event Content */}
                <div className="content">
                    <Image src={image} alt="Event Banner" width={800} height={800}  className="banner"/>

                    <section className="flex-col-gap-2">
                        <h2>Overview</h2>
                        <p>{overview}</p>
                    </section>
                    <section className="flex-col-gap-2">
                        <h2>Event Details</h2>
                        
                        <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
                        <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />
                        <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />
                        <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
                        <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
                    </section>

                    <EventAgenda agendaItems={agenda}/>

                    <section className="flex-col-gap-2">
                        <h2>About the Organizer</h2>
                        <p>{organizer}</p>
                    </section>
                    
                    <EventTags tags={tags} />
                </div>

                {/* Right Side - Booking Form */}
                <aside className="booking">
                    <div className="signup-card">
                        <h2>Book Your Spot</h2>
                        {bookings > 0 ? (
                            <p className="text-sm">Join {bookings} people who haved already booked their spot!</p>
                        ): (
                            <p className="text-sm">Be the first to book your spot!</p>
                        )}

                        <BookEvent eventId={String(event._id)} slug={event.slug}/>
                    </div>
                </aside>

            </div>
            <div className="flex w-full flex-col gap-4 pt-20">
                <h2>Similar Events</h2>
                <div className="events">
                    {similarEvents.length > 0 && similarEvents.map((similarEvent)=>(
                        <EventCard key={similarEvent.title} {... similarEvent } />
                    ))}
                </div>
            </div>
        </>
    )
}

const EventParamsWrapper = async ({params}: {params: Promise<{slug: string}>}) => {
    const { slug } = await params;
    return <EventContent slug={slug} />;
}

const EventDetailsPage = ({params} : {params: Promise<{slug: string}>}) => {
    return (
        <section id="event">
            <Suspense fallback={
                <div className="header">
                    <h1>Loading event...</h1>
                </div>
            }>
                <EventParamsWrapper params={params} />
            </Suspense>
        </section>
    )
}
export default EventDetailsPage
