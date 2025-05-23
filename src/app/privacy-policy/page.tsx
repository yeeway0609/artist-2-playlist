export default function Page() {
  return (
    <div className="text-wrap px-2 pb-20">
      <h1 className="page-title">Privacy Policy</h1>

      <p className="text-center">Last updated: 2025.04.21</p>
      <br />
      <p>If you choose to use our service, then you agree to the following terms in this policy:</p>

      <h2 className="text-h2 mt-4">Use of Information</h2>
      <p>We access the following information from your Spotify account:</p>
      <ul className="list-disc pl-5">
        <li>
          <strong>User Profile</strong>: such as your display name and profile image.
        </li>
        <li>
          <strong>Playlists</strong>: access to your private and public playlists to display and modify them.
        </li>
        <li>
          <strong>Artists Data</strong>: retrieve basic information about artists through Spotify search API.
        </li>
      </ul>

      <h2 className="text-h2 mt-4">Data Access and Storage</h2>
      <p>
        We access your data only through Spotify Web API, and <span className="text-red-400">do not</span> collect any
        personal data on our servers.
      </p>

      <h2 className="text-h2 mt-4">Compliance with Spotify Developer Policy</h2>
      <p>
        We adhere to{' '}
        <a className="text-link" href="https://developer.spotify.com/policy" target="_blank">
          Spotify Developer Policy
        </a>
        , ensuring that we access and use user data responsibly and transparently. We only request and process the data
        necessary to operate our service.
      </p>

      <h2 className="text-h2 mt-4">Third-Party Services</h2>
      <p>
        We utilize third-party services, such as <strong>Google Analytics</strong>, to collect basic website traffic
        information. These services help us understand user interactions with our website, enabling us to improve our
        services.
        <br />
        <br />
        For more details on how these services collect and process data, please refer to their respective privacy
        policies.
      </p>

      <h2 className="text-h2 mt-4">Changes to This Privacy Policy</h2>
      <p>
        We may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically for
        any changes. We will notify you of any changes by posting the new Privacy Policy on this page. These changes are
        effective immediately after they are posted on this page.
      </p>

      <h2 className="text-h2 mt-4">Contact Us</h2>
      <p>
        In line with transparency and community collaboration, we have made our source code available on GitHub. You can
        access it here:{' '}
        <a className="text-link" href="https://github.com/yeeway0609/artist-2-playlist" target="_blank">
          https://github.com/yeeway0609/artist-2-playlist
        </a>
        .
        <br />
        <br />
        If you have any questions or concerns about this website, please contact us at{' '}
        <a className="text-link" href="mailto:hi@yeeway.dev" target="_blank">
          hi@yeeway.dev
        </a>
        .
      </p>
    </div>
  )
}
