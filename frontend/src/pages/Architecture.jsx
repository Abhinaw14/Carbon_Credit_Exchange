import { HiOutlineShieldCheck, HiOutlineLightningBolt, HiOutlineCube, HiOutlineGlobe } from 'react-icons/hi';

export default function Architecture() {
    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white">
                    <HiOutlineGlobe size={20} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-text">Platform Architecture</h1>
                    <p className="text-text-muted text-sm">Understanding our hybrid blockchain system</p>
                </div>
            </div>

            <div className="glass-card p-6 sm:p-8 mb-6">
                <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
                    <HiOutlineLightningBolt className="text-primary" /> Hybrid Design
                </h2>
                <p className="text-text-muted leading-relaxed mb-4">
                    CarbonExchange uses a <strong className="text-text">hybrid architecture</strong> that combines
                    the speed and flexibility of off-chain systems with the transparency and immutability of blockchain technology.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InfoCard
                        icon={<HiOutlineCube className="text-accent" />}
                        title="Blockchain Layer"
                        items={[
                            'ERC-721 NFTs represent verified carbon credits',
                            'Smart contract handles English auctions',
                            'Bid placement and settlement on-chain',
                            'Immutable record of all transactions',
                            'ReentrancyGuard prevents exploit attacks',
                        ]}
                    />
                    <InfoCard
                        icon={<HiOutlineGlobe className="text-primary" />}
                        title="Backend Layer"
                        items={[
                            'Handles submission & verification workflow',
                            'Admin approval / rejection of credits',
                            'MongoDB caches auction events for fast UI',
                            'REST API serves data to the frontend',
                            'Event listener syncs blockchain → database',
                        ]}
                    />
                </div>
            </div>

            <div className="glass-card p-6 sm:p-8 mb-6">
                <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
                    <HiOutlineShieldCheck className="text-success" /> Trust & Transparency
                </h2>
                <div className="space-y-4 text-sm text-text-muted">
                    <TrustItem
                        title="Admin Cannot Alter Auction Results"
                        desc="Once an auction is created on the blockchain, the admin has no power to modify bids, change outcomes, or redirect funds. The smart contract enforces fair settlement."
                    />
                    <TrustItem
                        title="Smart Contracts Ensure Fairness"
                        desc="The Auction contract ensures only bids higher than the current highest bid are accepted, and funds are settled atomically upon finalization."
                    />
                    <TrustItem
                        title="Verification Is Separate From Settlement"
                        desc="Admins can only approve or reject credit submissions. The actual NFT minting and auction process is entirely governed by on-chain logic."
                    />
                    <TrustItem
                        title="All Actions Are Publicly Verifiable"
                        desc="Every auction creation, bid, and finalization emits events on the blockchain that anyone can independently verify."
                    />
                </div>
            </div>

            <div className="glass-card p-6 sm:p-8">
                <h2 className="text-xl font-bold text-text mb-4">System Flow</h2>
                <div className="space-y-3">
                    {[
                        { step: '1', label: 'Producer submits credit metadata', color: 'accent' },
                        { step: '2', label: 'Admin reviews and approves/rejects', color: 'warning' },
                        { step: '3', label: 'Producer mints approved credit as NFT', color: 'primary' },
                        { step: '4', label: 'Producer creates auction on-chain', color: 'primary' },
                        { step: '5', label: 'Bidders place bids via smart contract', color: 'accent' },
                        { step: '6', label: 'Auction finalizes — NFT transferred to winner', color: 'success' },
                    ].map(item => (
                        <div key={item.step} className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full bg-${item.color}/15 text-${item.color} flex items-center justify-center font-bold text-sm shrink-0`}>
                                {item.step}
                            </div>
                            <p className="text-text-muted">{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function InfoCard({ icon, title, items }) {
    return (
        <div className="bg-bg-dark/50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{icon}</span>
                <h3 className="font-semibold text-text">{title}</h3>
            </div>
            <ul className="space-y-2">
                {items.map((item, i) => (
                    <li key={i} className="text-sm text-text-muted flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function TrustItem({ title, desc }) {
    return (
        <div className="bg-bg-dark/50 rounded-xl p-4">
            <h4 className="font-semibold text-text mb-1">{title}</h4>
            <p>{desc}</p>
        </div>
    );
}
