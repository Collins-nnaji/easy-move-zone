import React from 'react';
import styled from 'styled-components';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import {
  FaArrowRight, FaCheckCircle, FaChevronLeft, FaComments, FaHome, FaMapMarkedAlt, FaBalanceScale,
  FaStar, FaTimes, FaTruck, FaVoteYea, FaWhatsapp,
} from 'react-icons/fa';
import { RENT_URL, MOVING_URL } from '../../config/platform';
import AreaBoard from './AreaBoard';
import {
  ScoreBars, RateForm, AreaTools, BoardRulesList,
} from './AreaPanels';
import { AreaAlternatives } from './AreaInsights';
import { SignInLink, stateLabel, whatsappShare } from './shared';

/**
 * An area page on a phone. The residents' poll — the score out of 5 and the
 * result for each factor — is the page; everything else is a tile that opens
 * a full-screen panel, the way /moving does. Each panel has its own URL
 * (/areas/:slug/board, /map, /compare, /vote), so Back closes it.
 */

const Wrap = styled.div`
  padding: 0.75rem 1rem 3rem;
`;
const Back = styled(Link)`
  display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.8rem; font-weight: 600; color: var(--color-ink-muted);
`;
const Head = styled.header`
  display: flex; align-items: flex-end; justify-content: space-between; gap: 0.75rem; margin: 0.6rem 0 0.85rem;
  > div { min-width: 0; }
  .eyebrow { font-size: 0.66rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-eyebrow); }
  h1 { margin: 0.15rem 0 0; font-size: 1.75rem; font-weight: 500; letter-spacing: -0.03em; line-height: 1.05; overflow-wrap: break-word; }
  .badge { display: inline-flex; align-items: center; gap: 0.3rem; margin-top: 0.4rem; font-size: 0.74rem; font-weight: 700; color: var(--color-green-deep); }
`;
const ShareBtn = styled.a`
  flex-shrink: 0; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 999px;
  background: #fff; border: 1px solid var(--color-line); color: #25d366; font-size: 1.1rem;
`;

const Poll = styled.section`
  background: #fff; border: 1px solid var(--color-line); border-radius: 18px; padding: 1rem; box-shadow: var(--shadow-soft);
  .k { font-size: 0.66rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-ink-faint); }
  .total { display: flex; align-items: center; gap: 0.75rem; margin: 0.35rem 0 0.9rem; }
  .big { font-family: var(--font-display); font-size: 2.6rem; font-weight: 500; letter-spacing: -0.04em; line-height: 1; }
  .big small { font-size: 1rem; color: var(--color-ink-faint); letter-spacing: 0; }
  .stars { display: flex; gap: 2px; color: #d4a017; font-size: 0.85rem; }
  .stars .off { color: var(--color-line-strong); }
  .votes { font-size: 0.78rem; color: var(--color-ink-muted); margin-top: 0.2rem; }
  .early { margin: 0.75rem 0 0; font-size: 0.74rem; color: var(--color-ink-faint); }
`;
const VoteBtn = styled(Link)`
  display: flex; align-items: center; justify-content: center; gap: 0.45rem; margin-top: 1rem; min-height: 46px;
  border-radius: 12px; background: var(--color-green-deep); color: #fff; font-weight: 700; font-size: 0.92rem;
  &:hover, &:active { color: #fff; background: var(--color-green-forest); }
`;

const Tiles = styled.div`
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.6rem; margin-top: 0.85rem;
  /* An odd tile out takes the whole last row. */
  > :last-child:nth-child(odd) { grid-column: 1 / -1; }
`;
const Tile = styled(Link)`
  position: relative; display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; padding: 0.8rem;
  border-radius: 14px; background: #fff; border: 1px solid var(--color-line); color: var(--color-ink);
  .ic { display: grid; place-items: center; width: 32px; height: 32px; margin-bottom: 0.4rem; border-radius: 9px;
    background: var(--color-green-soft); color: var(--color-green-deep); font-size: 0.85rem; }
  strong { font-size: 0.88rem; font-weight: 650; }
  span.s { font-size: 0.74rem; line-height: 1.35; color: var(--color-ink-muted); overflow-wrap: anywhere; }
  > svg { position: absolute; top: 0.85rem; right: 0.8rem; font-size: 0.65rem; color: var(--color-ink-faint); }
  &:hover, &:active { color: var(--color-ink); border-color: var(--color-green); }
`;

/*
 * Inside a panel the content sits straight on the panel's cream, without the
 * card chrome or the heading it has on the desktop page — the panel's own
 * title already says what it is.
 */
const Flat = styled.div`
  display: flex; flex-direction: column; gap: 1rem; min-width: 0;
  > section { background: transparent; border: 0; box-shadow: none; padding: 0; }
  > section > h2:first-child { display: none; }
  a[href^='/areas/'] { background: #fff; }
`;
const Rules = styled.details`
  border: 1px solid var(--color-line); border-radius: 14px; background: #fff; padding: 0.85rem 1rem;
  summary { cursor: pointer; font-weight: 700; font-size: 0.88rem; }
  ul { margin-top: 0.6rem; }
`;

function Stars({ value }) {
  return (
    <span className="stars" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => <FaStar key={n} className={value != null && value >= n - 0.25 ? '' : 'off'} />)}
    </span>
  );
}

function PanelModal({
  title, eyebrow, icon: Icon, onClose, children,
}) {
  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="moving-modal-overlay" />
        <Dialog.Content className="moving-modal" aria-describedby={undefined}>
          <header className="moving-modal-head">
            <div className="moving-modal-title">
              <span className="moving-modal-icon"><Icon size={16} /></span>
              <div>
                <p>{eyebrow}</p>
                <Dialog.Title>{title}</Dialog.Title>
              </div>
            </div>
            <Dialog.Close className="moving-modal-close" aria-label="Close"><FaTimes size={16} /></Dialog.Close>
          </header>
          <div className="moving-modal-body">
            <div className="moving-modal-inner">{children}</div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function AreaMobile({ data, signedIn, onRated }) {
  const { '*': panel } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    area, factors, ratings, viewer, myRating, rentals, insights,
  } = data;
  const base = `/areas/${area.slug}`;
  const posts = (insights?.topics || []).reduce((n, t) => n + t.count, 0);
  const alternatives = insights?.alternatives || [];
  // Tiles open panels with `state.fromArea`, so closing one steps back; a
  // panel opened from a shared link closes to the area page instead.
  const close = () => (location.state?.fromArea ? navigate(-1) : navigate(base, { replace: true }));
  const open = (id) => ({ to: `${base}/${id}`, state: { fromArea: true } });

  const PANELS = {
    vote: {
      icon: FaVoteYea,
      title: myRating ? 'Update your vote' : `Vote on ${area.name}`,
      body: viewer.signedIn
        ? <RateForm data={data} onRated={onRated} bare />
        : <p><SignInLink>Sign in to vote</SignInLink> on the light, water, flooding and safety where you live.</p>,
    },
    board: {
      icon: FaComments,
      title: 'Residents’ board',
      body: (
        <>
          <AreaBoard area={area} categories={data.categories} signedIn={signedIn} />
          <Rules><summary>Board rules</summary><BoardRulesList /></Rules>
        </>
      ),
    },
    map: { icon: FaMapMarkedAlt, title: 'Map and nearby', body: <Flat><AreaTools area={area} /></Flat> },
    compare: { icon: FaBalanceScale, title: `Compare with ${area.name}`, body: <Flat><AreaAlternatives data={data} bare /></Flat> },
  };
  const current = PANELS[panel];

  return (
    <Wrap>
      <Back to="/areas"><FaChevronLeft size={10} /> All neighbourhoods</Back>
      <Head>
        <div>
          <div className="eyebrow">{area.city === area.state ? area.city : `${area.city} · ${stateLabel(area.state)}`}</div>
          <h1>{area.name}</h1>
          {viewer.verifiedResident && <span className="badge"><FaCheckCircle /> You are a verified resident</span>}
        </div>
        <ShareBtn
          href={whatsappShare(`What is it like to live in ${area.name}, ${area.city}? See what residents say about light, water, flooding and rent:`, base)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Share on WhatsApp"
        >
          <FaWhatsapp />
        </ShareBtn>
      </Head>

      <Poll aria-labelledby="area-poll">
        <div className="k" id="area-poll">Residents&rsquo; poll</div>
        <div className="total">
          <span className="big">{ratings.overall != null ? ratings.overall.toFixed(1) : '—'}<small>/5</small></span>
          <span>
            <Stars value={ratings.overall} />
            <div className="votes">
              {ratings.count
                ? `${ratings.count} ${ratings.count === 1 ? 'vote' : 'votes'}${ratings.verifiedCount ? ` · ${ratings.verifiedCount} verified` : ''}`
                : 'No votes yet'}
            </div>
          </span>
        </div>
        <ScoreBars factors={factors} ratings={ratings} compact />
        {ratings.count > 0 && ratings.count < 5 && <p className="early">An early read from a few residents.</p>}
        <VoteBtn {...open('vote')}>
          <FaVoteYea /> {myRating ? 'Update my vote' : ratings.count ? 'Live here? Vote' : 'Be the first to vote'}
        </VoteBtn>
      </Poll>

      <Tiles>
        <Tile {...open('board')}>
          <span className="ic"><FaComments /></span>
          <strong>Residents&rsquo; board</strong>
          <span className="s">{posts ? `${posts} ${posts === 1 ? 'post' : 'posts'} lately` : 'Ask or share'}</span>
          <FaArrowRight />
        </Tile>
        <Tile {...open('map')}>
          <span className="ic"><FaMapMarkedAlt /></span>
          <strong>Map &amp; nearby</strong>
          <span className="s">Commute, hospitals, markets</span>
          <FaArrowRight />
        </Tile>
        {alternatives.length > 0 && (
          <Tile {...open('compare')}>
            <span className="ic"><FaBalanceScale /></span>
            <strong>Compare areas</strong>
            <span className="s">{alternatives.length} nearby {alternatives.length === 1 ? 'option' : 'options'}</span>
            <FaArrowRight />
          </Tile>
        )}
        <Tile to={`${RENT_URL}?q=${encodeURIComponent(area.name)}`}>
          <span className="ic"><FaHome /></span>
          <strong>Homes to rent</strong>
          <span className="s">{rentals ? `${rentals} here now` : 'Browse homes'}</span>
          <FaArrowRight />
        </Tile>
        <Tile to={area.movingCity ? `${MOVING_URL}/book?area=${encodeURIComponent(area.movingCity)}` : MOVING_URL}>
          <span className="ic"><FaTruck /></span>
          <strong>Move here</strong>
          <span className="s">Moving price in minutes</span>
          <FaArrowRight />
        </Tile>
      </Tiles>

      {current && (
        <PanelModal title={current.title} eyebrow={area.name} icon={current.icon} onClose={close}>
          {current.body}
        </PanelModal>
      )}
    </Wrap>
  );
}
