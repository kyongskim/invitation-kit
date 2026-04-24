import { config } from "@/invitation.config";
import { kakaoMapDeeplink } from "@/lib/map";

export function Venue() {
  const { venue } = config;
  const mapUrl = kakaoMapDeeplink({ name: venue.name, coords: venue.coords });
  const transportEntries: { label: string; value: string }[] = [];
  if (venue.transportation?.subway)
    transportEntries.push({
      label: "지하철",
      value: venue.transportation.subway,
    });
  if (venue.transportation?.bus)
    transportEntries.push({ label: "버스", value: venue.transportation.bus });
  if (venue.transportation?.car)
    transportEntries.push({ label: "자가용", value: venue.transportation.car });
  if (venue.transportation?.parking)
    transportEntries.push({
      label: "주차",
      value: venue.transportation.parking,
    });

  return (
    <section className="flex flex-col items-center px-6 py-24">
      <div className="animate-fade-in-up flex w-full max-w-md flex-col items-center text-center">
        <p className="text-secondary font-serif text-sm tracking-[0.3em] uppercase">
          Venue
        </p>
        <h2 className="text-primary mt-6 font-serif text-3xl font-light">
          {venue.name}
        </h2>
        {venue.hall && (
          <p className="text-secondary mt-2 text-sm">{venue.hall}</p>
        )}
        <p className="text-text mt-6 text-sm leading-relaxed">
          {venue.address}
        </p>

        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="border-secondary text-secondary hover:bg-secondary mt-8 inline-block rounded-sm border px-6 py-3 text-sm tracking-wider transition-colors hover:text-white"
        >
          카카오맵으로 보기
        </a>

        {transportEntries.length > 0 && (
          <dl className="mt-12 w-full space-y-4 text-left text-sm">
            {transportEntries.map((entry) => (
              <div key={entry.label} className="flex gap-4">
                <dt className="text-secondary w-12 shrink-0 font-medium">
                  {entry.label}
                </dt>
                <dd className="text-text leading-relaxed">{entry.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </section>
  );
}
