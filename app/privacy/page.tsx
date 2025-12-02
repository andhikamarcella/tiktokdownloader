export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6 text-gray-200">
      <h1 className="text-3xl font-semibold mb-2">Privacy Policy — TikTok Downloader Pro</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: January 2025</p>
      <div className="space-y-6 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white">Information We Collect</h2>
          <p>
            We only receive TikTok OAuth profile data you choose to share, including basic account
            details and the list of your public videos, as permitted by the granted scopes.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white">What We Do Not Collect</h2>
          <p>
            We do not collect your TikTok password, private videos, direct messages, or sensitive
            personal information. No payment data is collected or processed by this service.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white">How OAuth Data Is Used</h2>
          <p>
            OAuth data is used solely to display your TikTok profile and to list your public videos
            for optional bulk download within the app. Your permissions can be revoked anytime via
            TikTok account settings.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white">No Permanent Data Storage</h2>
          <p>
            Access tokens are stored in secure cookies for short-lived sessions only and are not
            persisted in databases. We do not permanently store downloaded videos or personal
            metadata on our servers.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white">Cookies and Analytics</h2>
          <p>
            Minimal cookies may be used for session continuity and preference handling. If analytics
            are enabled, they are used to improve service quality without storing personally
            identifiable information.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white">Data Security</h2>
          <p>
            We apply industry-standard security measures to protect tokens and API calls. However,
            no online service can guarantee absolute security, and users should manage access to
            their accounts responsibly.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white">Third-Party Services</h2>
          <p>
            The app relies on TikTok APIs and may use additional cloud services to deliver features.
            Their respective privacy policies govern the handling of data processed through those
            services.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white">User Rights</h2>
          <p>
            You may revoke TikTok OAuth access at any time from your TikTok account settings. If you
            have questions or requests related to your data within this app, contact us using the
            information below.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-white">Contact Information</h2>
          <p>
            For privacy inquiries, please reach out to support@tiktokdownloader.pro.
          </p>
        </section>
      </div>
    </div>
  );
}
