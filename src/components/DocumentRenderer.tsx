import React from 'react';

export function renderDocumentHTML(
  type: 'fine' | 'coe' | 'bond' | 'plagiarism' | 'noise' | 'utility',
  isMini: boolean
) {
  const p = isMini ? 'p-2 sm:p-3' : 'p-6 md:p-10';
  const textBase = isMini ? 'text-[8.5px] leading-snug' : 'text-xs md:text-sm leading-relaxed';
  const textSub = isMini ? 'text-[6.5px]' : 'text-[8.5px]';
  const textTitle = isMini ? 'text-[10px] font-black' : 'text-lg font-black';
  const titleBanner = isMini ? 'py-0.5 text-[7.5px]' : 'py-2.5 text-[10.5px]';
  const spacing = isMini ? 'mb-1' : 'mb-4';
  const borderB = isMini ? 'pb-1 mb-1.5 border-b' : 'pb-3 mb-4 border-b-2';
  
  if (type === 'bond') {
    return (
      <div className={`bg-white w-full ${isMini ? 'max-w-full' : 'max-w-2xl shadow-md border rounded-lg'} text-gray-800 font-sans relative ${p} ${textBase} break-words overflow-x-auto`}>
        {/* Header */}
        <div className={`flex justify-between border-slate-700 ${borderB}`}>
          <div>
            <div className={`${textTitle} text-[#1A365D] tracking-tight uppercase`}>Horizon</div>
            <div className={`${isMini ? 'text-[6px]' : 'text-[8px]'} font-bold text-[#D69E2E] tracking-widest uppercase mt-[-3px]`}>Residential VIC</div>
          </div>
          <div className={`text-right ${textSub} text-gray-400 font-mono leading-tight whitespace-pre-wrap max-w-[50%]`}>
            Suite 401, 123 Flinders Lane, Melbourne VIC 3000<br/>
            Phone: (03) 9876 5432 | admin@horizonvic.com.au
          </div>
        </div>

        {/* Metadata */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${spacing} ${textSub}`}>
          <div>
            <div className="font-bold text-gray-400 uppercase tracking-wider mb-0.5">Tenant Details:</div>
            <strong className="text-gray-800">Alex Thompson</strong><br/>
            4/85 Bourke Street, Melbourne VIC 3000
          </div>
          <div className="sm:text-right">
            <div className="font-bold text-gray-400 uppercase tracking-wider mb-0.5">Notice Reference:</div>
            <strong>Date:</strong> 30 June 2026<br/>
            <strong>Notice Ref:</strong> HZN-2026-8839<br/>
            <strong>Bond:</strong> $2,100.00 AUD
          </div>
        </div>

        {/* Notice Title */}
        <div className={`text-center font-bold text-red-800 bg-red-50 border border-red-200 rounded uppercase tracking-widest ${spacing} ${titleBanner}`}>
          Notice of Intention to Claim Rental Bond
        </div>

        <p className={spacing}>Dear Alex Thompson,</p>
        <p className={spacing}>
          We write to you in relation to your tenancy at <strong>4/85 Bourke Street, Melbourne VIC 3000</strong>, which finished on 26 June 2026. Following the final exit inspection done at the premises, Horizon Residential VIC intends to claim a deduction of <strong className="text-red-700 font-bold">$420.00 AUD</strong> from your total bond amount of $2,100.00 AUD.
        </p>

        {/* Table */}
        <div className="overflow-x-auto w-full mb-3">
          <table className="w-full text-left border border-gray-100 rounded overflow-hidden">
            <thead>
              <tr className="bg-[#1A365D] text-white text-[7.5px] sm:text-[9px]">
                <th className="p-1.5 font-bold uppercase overflow-hidden break-words">Description of Claim Cause</th>
                <th className="p-1.5 font-bold uppercase text-right" style={{ width: '80px' }}>Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-[7.5px] sm:text-[9px] break-words">
              <tr>
                <td className="p-1.5 text-gray-600">Professional carpet steam cleaning (stain removal in main living area floor)</td>
                <td className="p-1.5 text-right font-semibold text-gray-800">$180.00</td>
              </tr>
              <tr>
                <td className="p-1.5 text-gray-600 font-normal">Kitchen backsplashes, stove top deep cleaning and grease removal</td>
                <td className="p-1.5 text-right font-semibold text-gray-800">$90.00</td>
              </tr>
              <tr>
                <td className="p-1.5 text-gray-600 font-normal">Living-room drywall minor plaster repair and paint touch-up</td>
                <td className="p-1.5 text-right font-semibold text-gray-800">$150.00</td>
              </tr>
              <tr className="bg-neutral-50 font-bold text-[#1A365D]">
                <td className="p-1.5">Total Proposed Claim Deduction</td>
                <td className="p-1.5 text-right font-black">$420.00</td>
              </tr>
              <tr className="bg-[#FAF9F5] text-emerald-800 font-bold">
                <td className="p-1.5">Balance to be Released to Tenant</td>
                <td className="p-1.5 text-right font-black text-emerald-600">$1,680.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="font-bold uppercase text-[#1A365D] border-l-4 border-[#d69e2e] pl-1.5 mb-1 leading-none text-[8.5px] sm:text-[10px]">
          Statutory Right to Object
        </div>
        <p className={`text-gray-600 ${spacing} ${textSub}`}>
          If you agree to the deductions listed above, please sign the accompanying Bond Claim Form and return it to us. If you disagree, you have the statutory right to dispute this claim through <strong>Consumer Affairs Victoria (CAV)</strong>.
        </p>

        <div className={`bg-amber-50 border border-amber-200 border-l-4 border-amber-500 rounded p-2.5 text-amber-955 leading-normal ${spacing}`}>
          <strong className="text-red-750 font-bold uppercase text-[7.5px] sm:text-[9px]">Critical Deadline and Consequence of Inaction:</strong><br/>
          You must respond to this office in writing or initiate a dispute channel by no later than <strong className="text-red-700">5:00 PM on 14 July 2026</strong>. If you fail to respond or dispute by this deadline, Horizon Residential VIC will proceed with the automatic release of the reduced bond.
        </div>

        <div className="flex justify-between items-end mt-4 pt-2 border-t text-[8px] sm:text-[10px]">
          <div>
            <p className="text-gray-400 text-[6.5px] sm:text-[8px] leading-tight">Yours sincerely,<br/><strong className="text-gray-800">Evelyn Reed</strong><br/>Property Manager</p>
          </div>
          <div className="text-[6.5px] sm:text-[8px] text-gray-400 font-mono text-right italic max-w-[50%]">
            Complies with Victorian Residential Tenancies Act 1997.
          </div>
        </div>
      </div>
    );
  }

  if (type === 'fine') {
    return (
      <div className={`bg-white w-full ${isMini ? 'max-w-full' : 'max-w-2xl shadow-md border rounded-lg'} text-gray-800 font-sans relative ${p} ${textBase} break-words overflow-x-auto`}>
        {/* Header */}
        <div className={`flex justify-between border-[#1C362B] ${borderB}`}>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-[#1C362B] bg-[#1C362B]/5 flex items-center justify-center font-serif text-[#1C362B] font-bold text-[9px] sm:text-xs uppercase shadow-sm`}>B</div>
            <div>
              <div className={`${textTitle} text-[#1C362B] tracking-tight uppercase leading-none`}>City of Brentmoor</div>
              <div className={`${isMini ? 'text-[5.5px]' : 'text-[7.5px]'} text-gray-400 tracking-wider font-extrabold uppercase mt-0.5`}>Municipal Corporation VIC</div>
            </div>
          </div>
          <div className={`text-right ${textSub} text-gray-400 leading-tight whitespace-pre-wrap max-w-[50%]`}>
            Civic Centre, PO Box 15, Brentmoor VIC 3108<br/>
            ABN: 11 982 731 092
          </div>
        </div>

        {/* Metadata */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${spacing} ${textSub}`}>
          <div>
            <div className="font-bold text-gray-400 uppercase tracking-wider mb-0.5">Vehicle / Infringement Details:</div>
            <strong>Vehicle Reg:</strong> ABC-123<br/>
            <strong>Make/Model:</strong> Red Toyota Corolla sedan<br/>
            <strong>Location:</strong> Flinders Lane, Melbourne
          </div>
          <div className="sm:text-right">
            <div className="font-bold text-gray-400 uppercase tracking-wider mb-0.5">Notice Metadata:</div>
            <strong>Notice No:</strong> INF0432198<br/>
            <strong>Date of Issue:</strong> 5 April 2026<br/>
            <strong>Time:</strong> 3 April 2026 at 7:32 AM
          </div>
        </div>

        {/* Notice Title */}
        <div className={`text-center font-bold text-white bg-[#1C362B] rounded uppercase tracking-widest ${spacing} ${titleBanner}`}>
          Parking Infringement Notice
        </div>

        <p className={spacing}>
          This formal Infringement Notice has been issued under the <em>Road Safety Act 1986</em>. The vehicle listed above was observed stationary in a designated <strong>Clearway / Permit Zone</strong> on Flinders Lane during restricted hours, without showing a valid municipal permit.
        </p>

        {/* Table */}
        <div className="overflow-x-auto w-full mb-3">
          <table className="w-full text-left border border-gray-150 rounded overflow-hidden">
            <thead>
              <tr className="bg-[#1C362B] text-white text-[7.5px] sm:text-[9px]">
                <th className="p-1.5 font-bold uppercase overflow-hidden break-words">Offence Code & Description</th>
                <th className="p-1.5 font-bold uppercase text-right" style={{ width: '80px' }}>Penalty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white text-[7.5px] sm:text-[9px] break-words">
              <tr>
                <td className="p-1.5 text-gray-600 font-normal">Offence Code 204: Stopped in a Clearway or resident permit zone during restricted hours (Flinders Lane, Melbourne VIC 3000)</td>
                <td className="p-1.5 text-right font-semibold text-gray-800">$85.00</td>
              </tr>
              <tr className="bg-neutral-50 font-bold text-[#1C362B]">
                <td className="p-1.5">Total Amount Outstanding</td>
                <td className="p-1.5 text-right font-black">$85.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="font-bold uppercase text-[#1C362B] border-l-4 border-amber-600 pl-1.5 mb-1 leading-none text-[8.5px] sm:text-[10px]">
          Requirement to Pay
        </div>
        <p className={`text-gray-600 ${spacing} ${textSub}`}>
          Payment of the sum of <strong className="text-gray-900">$85.00 AUD</strong> is required by no later than <strong>1 May 2026</strong>. Failure to pay will result in referral to Fines Victoria, incurring additional statutory costs and enforcement actions.
        </p>

        <div className={`bg-[#FAF9F5] p-2.5 rounded-xl border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 ${spacing} ${textSub}`}>
          <div>
            <strong className="text-[#1C362B] uppercase text-[7.5px] sm:text-[8.5px] tracking-wider block mb-1">Payment Channels:</strong>
            <ul className="space-y-0.5 leading-tight text-gray-600 font-mono">
              <li><strong>BPay:</strong> Biller: 30129 | Ref: 98127391782</li>
              <li><strong>Online:</strong> paymentportal.brentmoor.vic.gov.au</li>
              <li><strong>Phone:</strong> 1300 982 112</li>
            </ul>
          </div>
          <div>
            <strong className="text-[#1C362B] uppercase text-[7.5px] sm:text-[8.5px] tracking-wider block mb-1">Right of Appeal / Dispute:</strong>
            <p className="leading-tight text-gray-500">
              You may request an internal executive review of this notice in writing within 28 days sending to PO Box 15, Brentmoor VIC 3108 stating compassionate factors.
            </p>
          </div>
        </div>

        <div className="flex justify-between items-end mt-4 pt-2 border-t text-[8px] sm:text-[10px]">
          <div>
            <p className="text-gray-400 text-[6.5px] sm:text-[8px] leading-tight font-sans">Issued by:<br/><span className="text-gray-700 font-semibold">Authorised Enforcement Officer</span><br/>City of Brentmoor Rangers Unit</p>
          </div>
          <div className="text-[6.5px] sm:text-[8px] text-gray-400 font-mono text-right">
            *INF0432198*
          </div>
        </div>
      </div>
    );
  }

  if (type === 'coe') {
    return (
      <div className={`bg-white w-full ${isMini ? 'max-w-full' : 'max-w-2xl shadow-md border rounded-lg'} text-gray-800 font-sans relative ${p} ${textBase} break-words overflow-x-auto`}>
        {/* Header */}
        <div className={`flex justify-between border-red-800 ${borderB}`}>
          <div>
            <div className={`${textTitle} text-red-900 tracking-tight uppercase`}>Westhaven University</div>
            <div className={`${isMini ? 'text-[6px]' : 'text-[8px]'} font-bold text-neutral-500 tracking-widest uppercase mt-[-3px]`}>Academic Progress Office, Melbourne</div>
          </div>
          <div className={`text-right ${textSub} text-gray-400 font-mono leading-tight whitespace-pre-wrap max-w-[50%]`}>
            Building A, 450 Flinders Lane, Melbourne VIC 3000<br/>
            CRICOS: 00123G
          </div>
        </div>

        {/* Student Metadata */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${spacing} ${textSub}`}>
          <div>
            <div className="font-bold text-neutral-400 uppercase tracking-widest mb-0.5">Student Details:</div>
            <strong className="text-gray-800">Li Wei Chen</strong><br/>
            <strong>Student ID:</strong> 10987654<br/>
            <strong>Course:</strong> Master of Applied Data Analytics
          </div>
          <div className="sm:text-right">
            <div className="font-bold text-neutral-400 uppercase tracking-wide mb-0.5">Notice Metadata:</div>
            <strong>Notice Date:</strong> 18 June 2026<br/>
            <strong>Committee Ref:</strong> CAPC-2026-T1-881<br/>
            <strong>Effective:</strong> 22 June 2026
          </div>
        </div>

        {/* Notice Title */}
        <div className={`text-center font-bold text-red-800 bg-red-50 border border-red-200 rounded uppercase tracking-widest ${spacing} ${titleBanner}`}>
          Outcome of Course Academic Progress Committee
        </div>

        <p className={spacing}>Dear Li Wei Chen,</p>
        <p className={spacing}>
          The Course Academic Progress Committee (CAPC) met on 18 June 2026 to review your academic progression following Semester 1 results. The CAPC noted that despite support arrangements in place, you failed all enrolled units in Semester 1 2026.
        </p>
        <p className={spacing}>
          Consequently, under University Academic progression regulations, the CAPC has decided to <strong className="text-red-900">terminate your enrolment</strong> at Westhaven University, effective from <strong>22 June 2026</strong>.
        </p>

        {/* Appeal Block */}
        <div className="font-bold uppercase text-red-900 border-l-4 border-red-800 pl-1.5 mb-1 leading-none text-[8.5px] sm:text-[10px]">
          Formal Academic Right of Appeal
        </div>
        <p className={`text-gray-600 ${spacing} ${textSub}`}>
          You have the right to appeal this outcome. A formal written appeal must be submitted within <strong>20 business days (by 5:00 PM on 20 July 2026)</strong> using the official CAPC Student Appeal Form. We strongly advise contacting the free, confidential <strong>Westhaven Student Advocacy Service</strong>.
        </p>

        {/* Immigration Warning */}
        <div className="bg-red-50 border border-red-200 rounded p-2.5 text-red-950 leading-normal my-2 text-[8px] sm:text-xs">
          <strong className="text-red-800 font-black flex items-center gap-1 uppercase tracking-wide text-[7.5px] sm:text-[9.5px] mb-1">
            ⚠️ Visa & Confirmation of Enrolment (CoE) Status:
          </strong>
          <p className="mb-1 font-sans">
            Please be informed that termination of your enrolment will result in the <strong>cancellations of your Confirmation of Enrolment (CoE)</strong>, which will be reported to the Department of Home Affairs (DHA).
          </p>
          <p className="font-bold font-sans">
            A cancelled CoE constitutes a breach of Student Visa Subclass 500 conditions, and your visa may be subject to cancellation.
          </p>
        </div>

        <div className="flex justify-between items-end mt-4 pt-2 border-t text-[8px] sm:text-[10px]">
          <div>
            <p className="text-gray-400 text-[6.5px] sm:text-[8px] leading-tight">Yours sincerely,<br/><strong className="text-gray-800">Dr. Elara Vance</strong><br/>Chair, CAPC Committee</p>
          </div>
          <div className="text-[6.5px] sm:text-[8px] text-gray-450 font-mono text-right max-w-[50%]">
            Westhaven Student Progress Unit
          </div>
        </div>
      </div>
    );
  }

  if (type === 'plagiarism') {
    return (
      <div className={`bg-white w-full ${isMini ? 'max-w-full' : 'max-w-2xl shadow-md border rounded-lg'} text-gray-800 font-sans relative ${p} ${textBase} break-words overflow-x-auto`}>
        {/* Header */}
        <div className={`flex justify-between border-[#1A365D] ${borderB}`}>
          <div>
            <div className={`${textTitle} text-[#1A365D] tracking-tight uppercase`}>Westhaven University</div>
            <div className={`${isMini ? 'text-[6px]' : 'text-[8px]'} font-bold text-neutral-500 tracking-widest uppercase mt-[-3px]`}>Academic Integrity Office, Melbourne</div>
          </div>
          <div className={`text-right ${textSub} text-gray-400 font-mono leading-tight whitespace-pre-wrap max-w-[50%]`}>
            Building B, 450 Flinders Lane, Melbourne VIC 3000<br/>
            integrity@westhaven.edu.au
          </div>
        </div>

        {/* Metadata */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${spacing} ${textSub}`}>
          <div>
            <div className="font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Student & Course Details:</div>
            <strong className="text-gray-800">Sarah Chen</strong><br/>
            <strong>Student ID:</strong> 10987654<br/>
            <strong>Course Unit:</strong> ECON101 Introduction to Economics
          </div>
          <div className="sm:text-right">
            <div className="font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Case Registry:</div>
            <strong>Reference No:</strong> AIO-2026-PL-492<br/>
            <strong>Allegation Date:</strong> 21 June 2026<br/>
            <strong>Assignment Name:</strong> Case Study 2: Market Dynamics
          </div>
        </div>

        {/* Notice Title */}
        <div className={`text-center font-bold text-[#1A365D] bg-[#1A365D]/5 border border-[#1A365D]/15 rounded uppercase tracking-widest ${spacing} ${titleBanner}`}>
          Notification of Academic Integrity Allegation
        </div>

        <p className={spacing}>Dear Sarah Chen,</p>
        <p className={spacing}>
          The Academic Integrity Office has received an official referral from your Course Coordinator concerning your assignment submission <strong>"Case Study 2: Market Dynamics"</strong> for ECON101. An initial review detected a <strong>48% duplication similarity rate</strong> with external publications, online repositories, and other academic papers.
        </p>
        <p className={spacing}>
          Under Policy, this constitutes an allegation of academic plagiarism and/or unauthorized collusion.
        </p>

        {/* Call to Meeting */}
        <div className={`p-2.5 bg-amber-50/75 border border-amber-200 rounded text-amber-955 ${spacing}`}>
          <strong className="text-amber-900 font-extrabold uppercase text-[7.5px] sm:text-[9.5px] block mb-1">
            🗓️ Mandatory Interview Schedule & Attendance:
          </strong>
          <div className="mb-1 grid grid-cols-1 sm:grid-cols-3 gap-1 text-[7.5px] sm:text-[9px]">
            <span><strong>Date:</strong> 3 July 2026</span>
            <span><strong>Time:</strong> 10:00 AM AEST</span>
            <span><strong>Venue:</strong> Room 4.12, Melb</span>
          </div>
          <p className="text-[7.5px] sm:text-[8.5px] mt-1 text-gray-500">
            Confirm your attendance by no later than <strong>5:00 PM on 28 June 2026</strong> via email at integrity@westhaven.edu.au.
          </p>
        </div>

        <div className="font-bold uppercase text-[#1A365D] border-l-4 border-amber-500 pl-1.5 mb-1 leading-none text-[8.5px] sm:text-[10px]">
          Support Person & Possible Penalties
        </div>
        <p className={`text-gray-600 ${spacing} ${textSub}`}>
          You may be accompanied by a student advocate from the Westhaven Student Advocacy Service. Potential penalties might include zero marks for the assignment, unit fail grade, or suspension.
        </p>

        <div className="flex justify-between items-end mt-4 pt-2 border-t text-[8px] sm:text-[10px]">
          <div>
            <p className="text-gray-400 text-[6.5px] sm:text-[8px] leading-tight font-sans">Yours sincerely,<br/><strong className="text-gray-800">Prof. Alistair Croft</strong><br/>Chair, Integrity Committee</p>
          </div>
          <div className="text-[6.5px] sm:text-[8px] text-gray-450 font-mono text-right max-w-[50%]">
            AIO Registry Melbourne
          </div>
        </div>
      </div>
    );
  }

  if (type === 'noise') {
    return (
      <div className={`bg-white w-full ${isMini ? 'max-w-full' : 'max-w-2xl shadow-md border rounded-lg'} text-gray-800 font-sans relative ${p} ${textBase} break-words overflow-x-auto`}>
        {/* Header */}
        <div className={`flex justify-between border-emerald-800 ${borderB}`}>
          <div>
            <div className={`${textTitle} text-emerald-900 tracking-tight uppercase`}>Meridian Strata</div>
            <div className={`${isMini ? 'text-[5.5px]' : 'text-[7.5px]'} font-bold text-neutral-500 tracking-widest uppercase mt-[-3px]`}>Strata & Owners Corporation VIC</div>
          </div>
          <div className={`text-right ${textSub} text-gray-400 font-mono leading-tight whitespace-pre-wrap max-w-[50%]`}>
            Suite 101, 88 Flinders Lane, Melbourne VIC 3000<br/>
            compliance@meridianstrata.com.au
          </div>
        </div>

        {/* Metadata */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${spacing} ${textSub}`}>
          <div>
            <div className="font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Recipient Details:</div>
            <strong>The Occupier</strong><br/>
            Apartment 4B, 88 Flinders Lane<br/>
            Melbourne VIC 3000
          </div>
          <div className="sm:text-right">
            <div className="font-bold text-neutral-800 uppercase tracking-wider mb-0.5">Notice Reference:</div>
            <strong>Date:</strong> 22 June 2026<br/>
            <strong>Ref:</strong> BN/220626/110<br/>
            <strong>Owners Corp Plan:</strong> PS 123456
          </div>
        </div>

        {/* Notice Title */}
        <div className={`text-center font-bold text-red-800 bg-red-50 border border-red-200 rounded uppercase tracking-widest ${spacing} ${titleBanner}`}>
          Formal Noise Complaint & Breach Notice
        </div>

        <p className={spacing}>To the Occupier,</p>
        <p className={spacing}>
          We act on behalf of the Owners Corporation Plan No. PS 123456 representing the property at 88 Flinders Lane. We have received multiple complaints regarding excessive noise emanating from <strong>Apartment 4B</strong>.
        </p>
        <p className={spacing}>
          Over the past four weeks, specific disturbances were documented after <strong>10:00 PM</strong>, including shouting and loud party music. This directly breaches strata model bylaws.
        </p>

        {/* Penalty & VCAT Block */}
        <div className={`p-2.5 bg-amber-50/70 border border-amber-200 rounded leading-normal text-amber-955 ${spacing}`}>
          <strong className="text-amber-900 font-extrabold uppercase text-[7.5px] sm:text-[9.5px] block mb-1">
            ⚠️ Impending Escalation to VCAT:
          </strong>
          If further noise violations occur, the Owners Corporation will apply to the <strong>Victorian Civil and Administrative Tribunal (VCAT)</strong>. Fines might reach <strong>$1,000.00 AUD</strong>.
        </div>

        <div className="font-bold uppercase text-[#1C362B] border-l-4 border-emerald-600 pl-1.5 mb-1 leading-none text-[8.5px] sm:text-[10px]">
          How to Respond / Dispute
        </div>
        <p className={`text-gray-600 ${spacing} ${textSub}`}>
          You must submit his/her response in writing within 14 days (by <strong>6 July 2026</strong>) by emailing us at compliance@meridianstrata.com.au.
        </p>

        <div className="flex justify-between items-end mt-4 pt-2 border-t text-[8px] sm:text-[10px]">
          <div>
            <p className="text-gray-400 text-[6.5px] sm:text-[8px] leading-tight font-sans">Yours sincerely,<br/><strong className="text-gray-800">Oliver Vance</strong><br/>Property Manager</p>
          </div>
          <div className="text-[6.5px] sm:text-[8px] text-gray-400 font-mono text-right max-w-[50%]">
            Strata Compliance Registry VIC
          </div>
        </div>
      </div>
    );
  }

  if (type === 'utility') {
    return (
      <div className={`bg-white w-full ${isMini ? 'max-w-full' : 'max-w-2xl shadow-md border rounded-lg'} text-gray-800 font-sans relative ${p} ${textBase} break-words overflow-x-auto`}>
        {/* Header */}
        <div className={`flex justify-between border-red-800 ${borderB}`}>
          <div>
            <div className={`${textTitle} text-red-950 tracking-tight uppercase`}>Coastal Energy & Water</div>
            <div className={`${isMini ? 'text-[6px]' : 'text-[8.5px]'} font-bold text-gray-400 tracking-widest uppercase mt-[-3px]`}>Public Civil Utility Services VIC</div>
          </div>
          <div className={`text-right ${textSub} text-gray-400 leading-tight whitespace-pre-wrap max-w-[50%]`}>
            200 Spencer Street, Melbourne VIC 3000<br/>
            ABN: 77 102 384 102
          </div>
        </div>

        {/* Metadata */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 ${spacing} ${textSub}`}>
          <div>
            <div className="font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Customer & Address:</div>
            <strong className="text-gray-800">Mrs. Eleanor Vance</strong><br/>
            14 Flinders Lane, Melbourne VIC 3000
          </div>
          <div className="sm:text-right">
            <div className="font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Account & Invoice:</div>
            <strong>Account No:</strong> 9876 543 210<br/>
            <strong>Notice Date:</strong> 22 June 2026<br/>
            <strong>Original Due Date:</strong> 1 June 2026
          </div>
        </div>

        {/* Alert Banner */}
        <div className={`text-center font-bold text-white bg-red-800 rounded uppercase tracking-wider ${spacing} ${titleBanner}`}>
          ⚠️ URGENT — SERVICE DISCONNECTION WARNING
        </div>

        <p className={spacing}>Dear Mrs. Eleanor Vance,</p>
        <p className={spacing}>
          Our database indicates that payments for your electricity & water account are overdue. Despite prior notifications, the outstanding balance remains unpaid.
        </p>

        {/* Table */}
        <div className="overflow-x-auto w-full mb-3">
          <table className="w-full text-left border border-red-100 rounded overflow-hidden">
            <thead>
              <tr className="bg-red-800 text-white text-[7.5px] sm:text-[9px]">
                <th className="p-1.5 font-bold uppercase">Billing Description</th>
                <th className="p-1.5 font-bold uppercase text-right" style={{ width: '80px' }}>Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-200 bg-white text-[7.5px] sm:text-[9px] break-words">
              <tr>
                <td className="p-1.5 text-gray-600">Original usage bill due 1 June</td>
                <td className="p-1.5 text-right font-semibold text-gray-800">$245.80</td>
              </tr>
              <tr>
                <td className="p-1.5 text-gray-600 font-normal">Overdue account administration late fee</td>
                <td className="p-1.5 text-right font-semibold text-gray-800">$12.50</td>
              </tr>
              <tr className="bg-red-50 font-bold text-red-900">
                <td className="p-1.5">Grand Total Overdue Balance</td>
                <td className="p-1.5 text-right font-black">$258.30</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="font-bold uppercase text-red-950 border-l-4 border-red-800 pl-1.5 mb-1 leading-none text-[8.5px] sm:text-[10px]">
          Notice of Disconnection Deadline
        </div>
        <p className={`text-gray-600 ${spacing} ${textSub}`}>
          The outstanding default amount of <strong>$258.30 AUD</strong> must be cleared by no later than <strong>1 July 2026</strong>.
        </p>

        {/* Hardship Panel */}
        <div className={`bg-amber-50 border border-amber-200 rounded p-2.5 text-amber-955 leading-normal grid grid-cols-1 sm:grid-cols-2 gap-3 ${spacing} ${textSub}`}>
          <div>
            <strong className="text-amber-800 uppercase text-[7.5px] sm:text-[8.5px] tracking-wider block mb-0.5">Need Assistance? Hardship (EWOV):</strong>
            If experiencing difficulties, call our Hardship Program on <strong>1800 882 110</strong> immediately for payment plans.
          </div>
          <div>
            <strong className="text-amber-800 uppercase text-[7.5px] sm:text-[8.5px] tracking-wider block mb-0.5">Free Counseling:</strong>
            You may contact the national, confidential <strong>National Debt Helpline on 1800 007 007</strong> for free counseling.
          </div>
        </div>

        {/* Payment info - FIXED layout with overflow break-words and responsive grid columns */}
        <div className={`bg-gray-50 border border-gray-150 p-2.5 rounded-lg ${spacing} ${textSub}`}>
          <strong className="text-gray-700 uppercase text-[7.5px] sm:text-[8.5px] tracking-wider block mb-1">Payment Instructions:</strong>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 font-mono text-gray-600 break-words leading-tight">
            <span><strong>BPay:</strong> Biller: 1102 | Ref: 98765432104</span>
            <span><strong>Online:</strong> coastalenergy.com.au/pay</span>
            <span><strong>Phone:</strong> 1300 882 110</span>
          </div>
        </div>

        <div className="flex justify-between items-end mt-4 pt-2 border-t text-[8px] sm:text-[10px]">
          <div>
            <p className="text-gray-400 text-[6.5px] sm:text-[8px] leading-tight">By: <strong className="text-gray-800">Coastal Billing Operations</strong><br/>Accounts Disconnection Department</p>
          </div>
          <div className="text-[6.5px] sm:text-[8px] text-gray-400 font-mono text-right">
            *9876543210*
          </div>
        </div>
      </div>
    );
  }

  return null;
}
