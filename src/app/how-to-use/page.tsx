export default function Page() {
  return (
    <div className="pb-20">
      <h1 className="mb-8 mt-4 text-center text-2xl font-semibold text-primary">How to use</h1>

      <video className="aspect-[9/16] h-[480px] w-[270px] rounded-lg border border-gray-500" controls muted>
        <source src="/how-to-use.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  )
}
