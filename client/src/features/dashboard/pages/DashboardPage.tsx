function DashboardPage() {
  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome to RESOLVE
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage and resolve customer support requests.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Open Tickets</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">24</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">In Progress</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">12</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Resolved</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">87</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Urgent</p>
          <p className="mt-2 text-3xl font-bold text-red-600">3</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;