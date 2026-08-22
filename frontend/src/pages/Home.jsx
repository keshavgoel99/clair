import CampaignCard from '../components/CampaignCard'

const campaigns = [
  {
    id: 1,
    title: 'Flood Relief Kits',
    ngo: 'Hope Relief Foundation',
    category: 'Disaster Relief',
    description:
      'Provide essential food, water and hygiene kits to families affected by flooding.',
    raised: 325000,
    target: 500000,
  },
  {
    id: 2,
    title: 'School Supplies',
    ngo: 'Education For All',
    category: 'Education',
    description:
      'Provide school bags, notebooks and essential learning materials to children.',
    raised: 180000,
    target: 300000,
  },
  {
    id: 3,
    title: 'Community Food Program',
    ngo: 'Community Care NGO',
    category: 'Food Relief',
    description:
      'Fund essential food supplies for vulnerable families in local communities.',
    raised: 420000,
    target: 600000,
  },
]

function Home({ onPledge }) {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">

      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
          Active Campaigns
        </p>

        <h2 className="mt-2 text-3xl font-bold text-slate-900">
          Choose where you want to contribute
        </h2>

        <p className="mt-3 max-w-2xl text-slate-500">
          Make a pledge toward an NGO campaign and track how the
          contribution is eventually utilized.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onPledge={onPledge}
          />
        ))}

      </div>

    </main>
  )
}

export default Home