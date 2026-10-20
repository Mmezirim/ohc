import { useState } from 'react';
import Icon from './Icon.jsx';

/**
 * Click-to-load YouTube player: shows the thumbnail until pressed, so pages don't
 * download the heavy YouTube iframe until someone actually wants to watch.
 */
export function YouTubePlayer({ id, title, badge, thumbnail }) {
  const [active, setActive] = useState(false);
  if (!id) return null;
  return (
    <div className="yt">
      {active ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <button type="button" className="yt__poster" onClick={() => setActive(true)} aria-label={`Play: ${title}`}>
          <img src={thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" />
          {badge && <span className="yt__badge">{badge}</span>}
          <span className="yt__play">
            <Icon name="play" size={28} />
          </span>
        </button>
      )}
    </div>
  );
}

export function LiveStream({ channelId }) {
  return (
    <div className="yt">
      <iframe
        src={`https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1`}
        title="Oak House Church live stream"
        allow="autoplay; encrypted-media; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
