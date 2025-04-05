export default function PrivacyPolicy() {
  return (
    <div className="text-wrap pb-20">
      <h1 className="my-4 text-center text-2xl font-semibold text-primary">Privacy Policy</h1>

      <h2 className="text-h2">Use of Information</h2>
      <p>
        We access the following information from your <strong>Spotify</strong> account:
      </p>
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
      <p>We access your data only through Spotify Web API, and do not collect any personal data on our servers.</p>

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
        services. For more details on how these services collect and process data, please refer to their respective
        privacy policies.
      </p>

      <h2 className="text-h2 mt-4">Contact Us</h2>
      <p>
        In line with transparency and community collaboration, we have made our source code available on GitHub. You can
        access it here:{' '}
        <a className="text-link" href="https://github.com/yeeway0609/artist-2-playlist" target="_blank">
          https://github.com/yeeway0609/artist-2-playlist
        </a>
        . If you have any questions or concerns about this website, please contact us at{' '}
        <a className="text-link" href="mailto:hi@yeeway.dev" target="_blank">
          hi@yeeway.dev
        </a>
        .
      </p>
    </div>
  )
}
