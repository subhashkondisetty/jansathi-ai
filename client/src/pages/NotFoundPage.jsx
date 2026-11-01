/**
 * @fileoverview Accessible 404 Not Found Page.
 */

import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import Card, { CardBody } from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';

export default function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto py-12">
      <Card className="border-slate-200 text-center">
        <CardBody className="p-8 space-y-4 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Compass className="w-7 h-7" aria-hidden="true" />
          </div>

          <div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 mb-2">
              Error 404
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Page Not Found</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              The page or civic resource you requested does not exist or has been relocated.
            </p>
          </div>

          <div className="pt-2">
            <Link to="/">
              <Button variant="primary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
                Return to Citizen Portal
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
