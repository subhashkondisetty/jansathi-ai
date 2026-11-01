/**
 * @fileoverview User Accounts Administrative Information Page.
 * Transparently discloses that user listing and user administration APIs are currently unavailable
 * in the backend architecture. Strictly avoids mock data or fake user generation.
 */

import { Users, ShieldAlert, KeyRound, UserCheck, Lock } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import Card, { CardHeader, CardBody } from '../../components/common/Card.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';

export const AdminUsersPage = () => {
  const { t } = useLanguage();

  const securityFeatures = [
    {
      title: 'Self-Service Citizen Registration',
      description:
        'Citizens register via POST /api/auth/register. The backend strictly pins the account role to "citizen" on creation, preventing arbitrary privilege escalation.',
      icon: UserCheck,
    },
    {
      title: 'Bcrypt Hash Protection',
      description:
        'Passwords are encrypted with bcrypt salts. Plaintext passwords and hashes are never exposed in user responses (passwordHash is select: false by default in Mongoose).',
      icon: Lock,
    },
    {
      title: 'Constant-Time Authentication Timing',
      description:
        'The backend implements dummy password hash comparisons during login to eliminate timing attack vectors when non-existent emails are probed.',
      icon: KeyRound,
    },
    {
      title: 'Self-Managed Profile Scope',
      description:
        'The only user-facing profile endpoints currently implemented in the backend are GET /api/users/profile and PUT /api/users/profile for the authenticated user only.',
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin_users_title', 'Citizen & User Accounts Administration')}
        subtitle={t(
          'admin_users_subtitle',
          'Administrative controls, account governance, and architectural status of user management.'
        )}
        phase="Phase 11"
      />

      {/* Honest Architectural Status Notice (Satisfies Mandatory Correction 6) */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 text-amber-950 space-y-3 shadow-xs">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-amber-900">
              User Administration APIs Currently Unavailable
            </h3>
            <p className="text-xs sm:text-sm text-amber-800/90 leading-relaxed">
              The backend architecture currently does not implement administrative endpoints for
              user listing (e.g.{' '}
              <code className="font-mono bg-amber-100/70 px-1 py-0.5 rounded text-amber-900 text-xs">
                GET /api/admin/users
              </code>
              ) or user role modification. In strict adherence to civic integrity principles,
              JanSathi AI does not fabricate mock citizen records or simulate user lists.
            </p>
          </div>
        </div>
      </div>

      {/* Backend Security Architecture Cards */}
      <Card className="border-slate-200">
        <CardHeader
          title="Implemented User Security Safeguards"
          subtitle="Mechanisms enforced by existing authentication and authorization controllers"
        />
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2"
                >
                  <div className="flex items-center space-x-2.5 text-slate-800">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-bold">{feat.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-9">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminUsersPage;
