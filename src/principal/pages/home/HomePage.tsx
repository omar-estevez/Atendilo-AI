import { ChatDemoSection } from "./sections/ChatDemoSection"
import { FeaturesSection } from "./sections/FeaturesSection"
import { FinalCTASection } from "./sections/FinalCTASection"
import { HeroSection } from "./sections/HeroSection"
import { HowItWorksSection } from "./sections/HowItWorksSection"
import { IndustriesSection } from "./sections/IndustriesSection"
import { PricingSection } from "./sections/PricingSection"
import { SocialProofSection } from "./sections/SocialProofSection"

export const HomePage = () => {
    return (
        <>
            <HeroSection />
            <SocialProofSection />
            <FeaturesSection />
            <HowItWorksSection />
            <IndustriesSection />
            <ChatDemoSection />
            <PricingSection />
            <FinalCTASection />
        </>
    )
}

export default HomePage;