/* Topic: paper-rl-pid-pacing  ·  subject: Research papers  ·  registered in js/config.js
   Notes on a research paper: an RL agent that tunes a PID budget-pacing controller once a day.
   Content comes only from the user's reading notes. */
TERMS['paper-rl-pid-pacing'] = { name: 'Paper: RL-tuned PID pacing', needs: ['max-conversions'],
    short: 'Notes on a paper where a PID controller paces each campaign\'s budget through the day, and a reinforcement learning agent picks, once a day, how strongly the controller should react.',
    body: () => `
      <h2>The idea in one paragraph</h2>
      <p>A <b>PID controller</b> keeps each campaign's spending on track through the day by nudging its bid multiplier, much like the pacer in the ${T('max-conversions', 'Maximize Conversions project')}. How hard it reacts is set by its <b>gains</b>. Instead of using the same default gains for every campaign, a <b>reinforcement learning agent</b> looks at each campaign once a day and picks a multiplier for each gain: react more, less, or the default amount.</p>
      <ol class="pipe" style="--n:4">
        <li><b>Each morning</b><span>the agent reads a snapshot of the campaign: what it spent, what clicks cost</span></li>
        <li><b>Pick a row</b><span>a multiplier for the P and I gains (D stays at 1×)</span></li>
        <li><b>All day</b><span>the PID controller uses those gains to adjust the bid multiplier</span></li>
        <li><b>Every bid</b><span>value of the ad view × bid multiplier</span></li>
      </ol>

      <h2>Background: reinforcement learning</h2>
      <p>Reinforcement learning (RL) is machine learning by trial and error. An agent takes actions in an environment, gets rewards or penalties, and over time learns a strategy, called a <b>policy</b>, that earns the most total reward. It's never shown the right answers. It finds out what works from the results of its own actions.</p>
      <div class="tbl-wrap"><table>
        <tr><th>Piece</th><th>What it is</th><th>In this paper</th></tr>
        <tr><td><b>Agent</b></td><td>The learner</td><td>The system that tunes the gains</td></tr>
        <tr><td><b>Environment</b></td><td>The world it acts in</td><td>A campaign's auctions over a day</td></tr>
        <tr><td><b>State</b></td><td>The current situation</td><td>The daily snapshot: spend so far, what clicks cost</td></tr>
        <tr><td><b>Action</b></td><td>What the agent chooses</td><td>A multiplier for each gain, such as 1.2×</td></tr>
        <tr><td><b>Reward</b></td><td>A number saying how good the outcome was</td><td>Not covered in these notes yet</td></tr>
      </table></div>
      <ul>
        <li><b>Exploration versus exploitation.</b> The agent has to choose between trying new actions that might be better and sticking with what already works.</li>
        <li><b>Delayed rewards.</b> A chess move might only pay off 30 moves later, so the agent has to work out which earlier choices led to the result.</li>
        <li><b>Where it's used:</b> DeepMind's AlphaGo, robots learning to walk, recommendation systems, and training chatbots through RLHF (reinforcement learning from human feedback), where people's ratings become the reward.</li>
      </ul>

      <h2>The three knobs: P, I and D</h2>
      <p>The controller adds small pushes to the bid multiplier. Each knob looks at something different:</p>
      <div class="split three">
        <div><h3>P: right now</h3><p>"How far behind am I at this moment?" It looks only at the current gap. If you catch up, it drops to zero immediately.</p></div>
        <div><h3>I: the grudge</h3><p>"How far behind have I been, added up over the day?" It remembers. If you've been a little behind for hours, it keeps building, even when the current gap is small.</p></div>
        <div><h3>D: how fast it's changing</h3><p>"Is the gap growing or shrinking, and how fast?" Shrinking fast: ease off so you don't overshoot. Growing fast: push harder early.</p></div>
      </div>
      <p><b>Driving analogy:</b> you're trying to arrive on time. P compares your speed with the speed you need right now and presses the gas accordingly. I remembers you've been running late all trip, so it keeps a little extra pressure on the gas even at normal speed, to make up lost time. D notices you're closing in on the car ahead quickly and taps the brake before you get too close.</p>

      <h2>What the agent controls</h2>
      <p>Each knob has a default strength, its gain. The agent picks a multiplier that scales it for the day (Eq. 2 in the paper):</p>
      <div class="formula">today's gain = multiplier × default gain</div>
      <p>There are 3 multiplier choices per knob. D is always left at 1×, so in practice the agent tunes only P and I.</p>

      <h2>Worked example: one day for Cozy Candle Co.</h2>
      <p>A made-up campaign on its second-to-last day, before a sale ends on Sunday. Today's row from the agent:</p>
      <div class="tbl-wrap"><table>
        <tr><th>Knob</th><th class="num">Multiplier</th></tr>
        <tr><td>P ("right now")</td><td class="num">1.2×</td></tr>
        <tr><td>I ("grudge")</td><td class="num">1.2×</td></tr>
        <tr><td>D ("how fast is it changing")</td><td class="num">1× (always)</td></tr>
      </table></div>

      <h3>Step 1: Turn the multipliers into gains</h3>
      <p class="note">The default gains below are made up but realistic, for illustration. They aren't from the paper.</p>
      <div class="tbl-wrap"><table>
        <tr><th>Knob</th><th>Default gain</th><th class="num">× multiplier</th><th>Today's gain</th></tr>
        <tr><td>P</td><td>raise the bid multiplier 0.05 per $100 behind right now</td><td class="num">× 1.2</td><td>0.06 per $100</td></tr>
        <tr><td>I</td><td>raise it 0.01 per $100 of total "behind-ness" so far</td><td class="num">× 1.2</td><td>0.012 per $100</td></tr>
      </table></div>

      <h3>Step 2: The controller uses those gains all day</h3>
      <p>Bid = value of the ad view × bid multiplier, and the bid multiplier starts the day at 0.80. The real controller checks every few seconds. These are snapshots:</p>
      <div class="tbl-wrap"><table>
        <tr><th>Time</th><th class="num">Behind by</th><th class="num">Total behind so far</th><th class="num">P push</th><th class="num">I push</th><th class="num">New bid multiplier</th></tr>
        <tr><td>10am</td><td class="num">$40</td><td class="num">$40</td><td class="num">+0.024</td><td class="num">+0.005</td><td class="num">0.80 → 0.829</td></tr>
        <tr><td>Noon</td><td class="num">$60</td><td class="num">$100</td><td class="num">+0.036</td><td class="num">+0.012</td><td class="num">→ 0.877</td></tr>
        <tr><td>3pm</td><td class="num">$20 (catching up)</td><td class="num">$120</td><td class="num">+0.012</td><td class="num">+0.014</td><td class="num">→ 0.903</td></tr>
        <tr><td>8pm</td><td class="num">−$20 (now ahead)</td><td class="num">$100</td><td class="num">−0.012</td><td class="num">+0.012</td><td class="num">→ 0.903 (holds)</td></tr>
      </table></div>
      <p><b>The noon row, worked out.</b> Cozy Candle should have spent $400 but has spent $340, so it's $60 behind.</p>
      <ul>
        <li>P push = 0.06 × (60 ÷ 100) = <b>+0.036</b></li>
        <li>Total behind so far = $40 (at 10am) + $60 (now) = $100, so I push = 0.012 × (100 ÷ 100) = <b>+0.012</b></li>
        <li>New bid multiplier = 0.829 + 0.036 + 0.012 = <b>0.877</b></li>
      </ul>
      <p><b>The 8pm row:</b> the campaign is finally $20 ahead, so P says "ease off" (−0.012). But it was behind all day, so I says "keep it up" (+0.012). They cancel, and the bid multiplier holds steady.</p>
      <p><b>What 1.2× did:</b> both pushes are 20% bigger than default. With default settings, noon would have been +0.030 and +0.010 instead of +0.036 and +0.012.</p>

      <h3>Step 3: An actual bid</h3>
      <p>At 3pm, someone scrolling Pinterest is predicted to be worth $0.05 to Cozy Candle:</p>
      <div class="tbl-wrap"><table>
        <tr><th>Settings</th><th class="num">Bid multiplier at 3pm</th><th class="num">Bid</th></tr>
        <tr><td>Today's (1.2× / 1.2×)</td><td class="num">0.903</td><td class="num">$0.05 × 0.903 = $0.045</td></tr>
        <tr><td>Default (1× / 1×)</td><td class="num">about 0.885</td><td class="num">$0.044</td></tr>
      </table></div>
      <p>A tenth of a cent sounds tiny, but across millions of auctions the slightly higher bid wins noticeably more of them. That helps Cozy Candle spend its remaining budget before the sale ends.</p>
      <p><b>Tomorrow morning</b> the agent looks at the new snapshot (how much was spent today, what clicks cost) and writes a new row. It might stay at 1.2× / 1.2×, or ease off if the campaign has caught up.</p>

      <h2>Why D is never tuned</h2>
      <p>The paper says it briefly in §3.2: the derivative signal is "fairly noisy". Spending happens in bursts, so the rate of change jumps around for no real reason:</p>
      <div class="tbl-wrap"><table>
        <tr><th>Minute</th><th class="num">Auctions won</th><th class="num">Spent</th></tr>
        <tr><td>12:00–12:01</td><td class="num">3</td><td class="num">$0.15</td></tr>
        <tr><td>12:01–12:02</td><td class="num">0</td><td class="num">$0</td></tr>
        <tr><td>12:02–12:03</td><td class="num">7</td><td class="num">$0.35</td></tr>
      </table></div>
      <p>Nothing really changed in those minutes. It's luck in who happened to be scrolling. But D sees "gap growing, now shrinking fast, now growing" and pushes bids back and forth, like steering by a speedometer needle that jumps around at random.</p>
      <ul>
        <li><b>The paper's reason:</b> D's input is mostly noise, so its effect on the day's results is unreliable. The agent can't tell whether a D setting helped or hurt.</li>
        <li><b>An inference, not stated in the paper:</b> freezing D also keeps things simpler and safer. It cuts the choices from 27 (3 × 3 × 3) to 9, so each option needs less data to learn, and there are fewer ways for things to go wrong. P and I are where the real gains are: how hard to react, and how persistently.</li>
      </ul>
      <p>D isn't removed. The controller still uses it at its default strength. The agent just doesn't adjust it.</p>
` };

/* Check-yourself questions shown at the end of the page */
CHECKS['paper-rl-pid-pacing'] = [
  { q: 'A campaign was behind all morning and is now exactly on plan. Which push is still above zero?', opts: ['P', 'I', 'Neither'], a: 1,
    why: 'P looks only at the current gap, which is now zero. I adds up the gaps over the day, and those were all "behind", so it still pushes up.' },
  { q: 'The default P gain is 0.05 per $100 and today\'s P multiplier is 0.8×. The campaign is $50 behind. What is the P push?', opts: ['+0.020', '+0.025', '+0.040'], a: 0,
    why: 'Today\'s gain = 0.8 × 0.05 = 0.04 per $100. Push = 0.04 × (50 ÷ 100) = 0.020.' },
  { q: 'Why does the agent leave D at 1×?', opts: ['D is removed from the controller', 'Its input is too noisy to learn a good setting', 'D only works in first-price auctions'], a: 1,
    why: 'Spending comes in bursts, so the rate of change is mostly noise. The agent cannot tell whether a D setting helped, so D stays at its default.' }
];
