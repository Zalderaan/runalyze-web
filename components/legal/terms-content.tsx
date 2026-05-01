'use client';

export function TermsContent() {
    return (
        <div className="space-y-8 text-slate-700">

            {/* 1. Acceptance */}
            <section>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">1. Acceptance of Terms</h3>
                <p className="text-sm leading-relaxed">
                    By creating an account, accessing, or otherwise using the Runalyze platform (the &ldquo;Service&rdquo;),
                    you agree to be bound by these Terms of Use. If you do not agree to these terms,
                    you may not access or use the Service. These terms constitute a legally binding agreement
                    between you and the Runalyze team.
                </p>
            </section>

            {/* 2. Description */}
            <section>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">2. Description of Service</h3>
                <p className="text-sm leading-relaxed">
                    Runalyze is an AI-powered running form analysis tool that uses computer vision and pose
                    estimation technology to provide general fitness insights, biomechanical feedback, and
                    suggested training drills. The Service also facilitates consultations between users and
                    running coaches. Runalyze is intended solely as an informational and educational tool
                    for runners looking to improve their performance.
                </p>
            </section>

            {/* 3. Not Medical Advice — highlighted */}
            <section className="rounded-lg border-l-4 border-amber-400 bg-amber-50 px-5 py-4">
                <h3 className="text-lg font-semibold text-amber-800 mb-2">
                    3. Not Medical Advice ⚠️
                </h3>
                <div className="space-y-2 text-sm leading-relaxed text-amber-900">
                    <p>
                        <strong>Runalyze is NOT a substitute for professional medical advice, diagnosis, or treatment.</strong>{' '}
                        The analysis, feedback, scores, coaching insights, and any other content provided through
                        the Service are for general informational and educational purposes only.
                    </p>
                    <p>
                        <strong>Always consult a qualified healthcare provider</strong> — such as a physician,
                        physiotherapist, or sports medicine specialist — before beginning any new exercise
                        program, modifying your training, or making any health-related decisions based on
                        information from this platform.
                    </p>
                    <p>
                        AI-generated insights and pose estimation results are <strong>probabilistic estimates</strong> that
                        may contain errors, inaccuracies, or omissions. They should never be relied upon as
                        definitive medical or clinical assessments.
                    </p>
                    <p>
                        Any &ldquo;coaching&rdquo; or consultation features on Runalyze are for <strong>informational purposes
                        only</strong> and do not establish a doctor-patient, therapist-client, or any other
                        professional healthcare relationship.
                    </p>
                </div>
            </section>

            {/* 4. Assumption of Risk */}
            <section>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">4. Assumption of Risk</h3>
                <p className="text-sm leading-relaxed">
                    Running and other physical exercise activities carry <strong>inherent risks of injury</strong>,
                    including but not limited to muscle strains, stress fractures, joint injuries, and
                    cardiovascular events. By using Runalyze and acting on any suggestions provided by
                    the Service, you voluntarily acknowledge and assume all such risks. You agree that
                    participation in any physical activity based on Runalyze&rsquo;s recommendations is
                    undertaken at your own risk.
                </p>
            </section>

            {/* 5. Limitation of Liability — highlighted */}
            <section className="rounded-lg border-l-4 border-blue-400 bg-blue-50 px-5 py-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">5. Limitation of Liability</h3>
                <div className="space-y-2 text-sm leading-relaxed text-blue-900">
                    <p>
                        To the fullest extent permitted by applicable law, <strong>Runalyze, its developers,
                        owners, coaches, contributors, and affiliates shall not be liable</strong> for any
                        direct, indirect, incidental, special, consequential, or punitive damages, including
                        but not limited to:
                    </p>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                        <li>Physical injuries, pain, or harm resulting from exercise undertaken based on Runalyze&rsquo;s analysis or recommendations</li>
                        <li>Reliance on AI-generated pose estimation analysis, scores, or drill suggestions</li>
                        <li>Errors, inaccuracies, or omissions in any content provided by the Service</li>
                        <li>Interruptions or unavailability of the Service</li>
                        <li>Any other losses arising from your use of or inability to use the Service</li>
                    </ul>
                    <p>
                        This limitation applies regardless of whether such damages were foreseeable and whether
                        or not Runalyze has been advised of the possibility of such damages.
                    </p>
                </div>
            </section>

            {/* 6. User Data */}
            <section>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">6. User-Provided Data</h3>
                <p className="text-sm leading-relaxed">
                    You are solely responsible for the accuracy and completeness of data you provide
                    to Runalyze, including but not limited to height, weight, race times, and uploaded
                    video footage. Runalyze is <strong>not liable for inaccurate, incomplete, or misleading
                    analysis</strong> that results from inaccurate or poor-quality input data. Ensure that
                    any video you upload is recorded under adequate lighting, from an appropriate angle,
                    and is representative of your actual running form.
                </p>
            </section>

            {/* 7. AI Disclaimer */}
            <section>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">7. AI &amp; Pose Estimation Disclaimer</h3>
                <p className="text-sm leading-relaxed">
                    Runalyze&rsquo;s analysis is powered by computer vision models and machine learning algorithms
                    that have <strong>inherent technical limitations</strong>. Results may vary significantly based
                    on video quality, lighting conditions, camera angle, clothing, and other environmental factors.
                    The AI models are continuously improving but may produce errors or inconsistencies.
                    Analysis results should be interpreted as <strong>general guidance only</strong>, not as
                    precise clinical measurements.
                </p>
            </section>

            {/* 8. Coach Consultations */}
            <section>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">8. Coach Consultations</h3>
                <p className="text-sm leading-relaxed">
                    Coaches accessible through the Runalyze platform provide advice based on their own
                    knowledge and experience. Such advice <strong>represents the coach&rsquo;s personal opinion only</strong>{' '}
                    and is not endorsed, verified, or guaranteed by Runalyze. Runalyze does not verify
                    coaches&rsquo; credentials, certifications, or qualifications, and <strong>does not vet coaches
                    for medical or clinical expertise</strong>. Coach consultations do not constitute medical
                    advice and should not be treated as such.
                </p>
            </section>

            {/* 9. Changes */}
            <section>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">9. Changes to These Terms</h3>
                <p className="text-sm leading-relaxed">
                    Runalyze reserves the right to modify or update these Terms of Use at any time.
                    Changes will be posted on this page with an updated &ldquo;Last Updated&rdquo; date. Your
                    continued use of the Service after any such changes constitutes your acceptance
                    of the revised terms. It is your responsibility to review these terms periodically.
                </p>
            </section>

            {/* 10. Contact */}
            <section>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">10. Contact</h3>
                <p className="text-sm leading-relaxed">
                    If you have any questions, concerns, or feedback regarding these Terms of Use,
                    please contact us at{' '}
                    <a
                        href="mailto:support@runalyze.app"
                        className="text-blue-600 underline hover:text-blue-800"
                    >
                        support@runalyze.app
                    </a>.
                </p>
            </section>

        </div>
    );
}
