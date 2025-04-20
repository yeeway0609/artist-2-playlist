export default function Page() {
  return (
    <div className="pb-20">
      <h1 className="page-title">How to use</h1>

      <video className="mx-auto aspect-[9/16] h-[480px] w-[270px] rounded-lg border border-gray-500" controls muted>
        <source src="/how-to-use.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <h1 className="page-title mt-8">Install on your phone</h1>

      <div className="max-w-sm">
        <h3>For iPhone (Safari):</h3>
        <ol className="list-decimal pl-5">
          <li>
            Tap the <strong>Share</strong> button at the bottom of the screen.
          </li>
          <li>
            Select <strong>Add to Home Screen</strong>.
          </li>
          <li>
            Tap <strong>Add</strong> on the top-right corner.
          </li>
        </ol>
        <br />
        <h3>For Android (Chrome):</h3>
        <ol className="list-decimal pl-5">
          <li>
            Tap the <strong>menu</strong> button (<code>⋮</code>) on the top-right corner.
          </li>
          <li>
            Select <strong>Add to Home screen</strong>.
          </li>
          <li>
            Tap <strong>Add</strong>, then confirm again if prompted.
          </li>
        </ol>
        <br />
        <p>✅ You can now launch the app directly from your home screen, just like a native app!</p>
        <br />

        <img
          className="w-full rounded-lg border border-gray-500"
          src="/add-to-home-screen.jpeg"
          alt="add-to-home-screen-result"
          width={384}
          height={174}
        />
      </div>
    </div>
  )
}
