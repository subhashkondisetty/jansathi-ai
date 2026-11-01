/**
 * @fileoverview Citizen profile view and editing page communicating with GET/PUT /api/users/profile.
 * Dropdowns strictly rendered from OptionsContext.
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useOptions } from '../context/OptionsContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { User, Shield, Save, CheckCircle } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card, { CardHeader, CardBody } from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';

export const ProfilePage = () => {
  const { user, updateProfile, refreshProfile } = useAuth();
  const { options } = useOptions();
  const { success: toastSuccess, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    preferredLanguage: 'en',
    state: '',
    district: '',
    userCategory: 'general_citizen',
    educationLevel: '',
    courseOrOccupation: '',
    annualFamilyIncomeRange: '',
  });

  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        preferredLanguage: user.preferredLanguage || 'en',
        state: user.state || '',
        district: user.district || '',
        userCategory: user.userCategory || 'general_citizen',
        educationLevel: user.educationLevel || '',
        courseOrOccupation: user.courseOrOccupation || '',
        annualFamilyIncomeRange: user.annualFamilyIncomeRange || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFieldErrors({});

    const payload = {
      name: formData.name.trim() || undefined,
      preferredLanguage: formData.preferredLanguage || undefined,
      state: formData.state || null,
      district: formData.district.trim() || null,
      userCategory: formData.userCategory || undefined,
      educationLevel: formData.educationLevel || null,
      courseOrOccupation: formData.courseOrOccupation.trim() || null,
      annualFamilyIncomeRange: formData.annualFamilyIncomeRange || null,
    };

    const result = await updateProfile(payload);
    setSaving(false);

    if (result.success) {
      toastSuccess('Profile updated successfully');
      refreshProfile();
    } else {
      const err = result.error;
      toastError(err.message || 'Failed to update profile');
      if (err.details && Array.isArray(err.details)) {
        const mapped = {};
        err.details.forEach((d) => {
          if (d.field) mapped[d.field] = d.message;
        });
        setFieldErrors(mapped);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Citizen Profile"
        subtitle="Manage your citizen details to receive accurate eligibility evaluations."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardBody className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center font-bold text-xl shadow-xs">
                <User className="w-8 h-8" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">{user?.name || 'Citizen'}</h2>
                <p className="text-xs text-slate-500 break-all">{user?.email}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 capitalize">
                  <Shield className="w-3 h-3 mr-1 text-slate-500" aria-hidden="true" />
                  Role: {user?.role || 'citizen'}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <CheckCircle className="w-3 h-3 mr-1" aria-hidden="true" />
                  Active
                </span>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Profile Edit Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Personal & Eligibility Demographics"
              subtitle="Used strictly for deterministic benefit checklist evaluations."
            />
            <CardBody className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="prof-name"
                    name="name"
                    label="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    error={fieldErrors.name}
                  />

                  <div className="space-y-1.5 text-left">
                    <label
                      htmlFor="prof-language"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Preferred Language
                    </label>
                    <select
                      id="prof-language"
                      name="preferredLanguage"
                      value={formData.preferredLanguage}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 cursor-pointer"
                    >
                      {(options?.languages || []).map((l) => (
                        <option key={l.value} value={l.value}>
                          {l.nativeLabel || l.label} ({l.label})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label
                      htmlFor="prof-state"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      State / UT
                    </label>
                    <select
                      id="prof-state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 cursor-pointer"
                    >
                      <option value="">Select State</option>
                      {(options?.states || []).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    id="prof-district"
                    name="district"
                    label="District"
                    placeholder="e.g. Warangal, Patna, Pune"
                    value={formData.district}
                    onChange={handleChange}
                    error={fieldErrors.district}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label
                      htmlFor="prof-category"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Citizen Category
                    </label>
                    <select
                      id="prof-category"
                      name="userCategory"
                      value={formData.userCategory}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 cursor-pointer"
                    >
                      {(options?.userCategories || []).map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label
                      htmlFor="prof-education"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Education Level
                    </label>
                    <select
                      id="prof-education"
                      name="educationLevel"
                      value={formData.educationLevel}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 cursor-pointer"
                    >
                      <option value="">Select Level</option>
                      {(options?.educationLevels || []).map((lvl) => (
                        <option key={lvl.value} value={lvl.value}>
                          {lvl.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="prof-occupation"
                    name="courseOrOccupation"
                    label="Occupation / Course of Study"
                    placeholder="e.g. Agriculture, B.Tech, Small Merchant"
                    value={formData.courseOrOccupation}
                    onChange={handleChange}
                    error={fieldErrors.courseOrOccupation}
                  />

                  <div className="space-y-1.5 text-left">
                    <label
                      htmlFor="prof-income"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Annual Family Income Range
                    </label>
                    <select
                      id="prof-income"
                      name="annualFamilyIncomeRange"
                      value={formData.annualFamilyIncomeRange}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-600 cursor-pointer"
                    >
                      <option value="">Select Income Bracket</option>
                      {(options?.incomeRanges || []).map((inc) => (
                        <option key={inc.value} value={inc.value}>
                          {inc.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <Button type="submit" variant="primary" size="md" loading={saving}>
                    <Save className="w-4 h-4 mr-1.5" aria-hidden="true" />
                    Save Profile
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
