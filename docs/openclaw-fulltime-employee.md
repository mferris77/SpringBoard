# OpenClaw as a Full-Time Employee - Video Transcript

**Source:** https://www.youtube.com/watch?v=3110hx3ygp0
**Speaker:** Matthew Burman
**Duration:** ~42 minutes
**Date:** February 2026

---

[TRANSCRIPT]

I've used OpenClaw every day, all day for the past month, and I've gotten extremely good at it. I've released a number of OpenClaw use case videos, but in this one, I am taking it to another level. OpenClaw is now a full-time employee on my team.

So, I get a lot of sponsorship requests, companies who are emailing me asking me to sponsor my videos, which is fantastic, but I do get a lot of them. So, I gave my OpenClaw its own identity with a first name and last name, its own email address, basically an entire workspace account, so it looks completely legit. It is now basically a full-time employee for me.

I have a public-facing sponsorship email address that everybody can see. It's a group email address, and I have added OpenClaw's email to that. So, anybody who's emailing that public-facing email address, those emails will now get routed to my OpenClaw and what I do with it is absolutely wild.

So, here's an example email. This is not an actual sponsor email. I didn't want to share that publicly. This is just one that I created and sent to my OpenClaw's email address. "Hi, Madam Sarah, head of partnerships at Novabridge. We build workflow automation tools for teams." Okay, then we sign off. Novabridge.io is not a real email.

And so, what happened? Well, as you can see right up here, my OpenClaw identified that it is a sponsorship email and labeled it as such and actually used a very sophisticated rubric to score the email. And so it scores it low, medium, high, and exceptional. If it's exceptional, which is, I believe, 80 or higher, it doesn't do anything. It simply escalates it to my team. And so it scored this one a 38. And in fact, it wasn't actually sure how to score it because it had some weird signals. Obviously, it's coming from my personal email address, so it didn't really understand what to do with that. Also, I forgot to remove my signature from the email, so it signs off as Sarah Chen, and then it also signs off as Matthew Burman.

And when it doesn't have a high confidence about how to score something, something special happens. It pings me in Telegram. So, this is what that looks like. "Low confidence classification for review. The sender is me. Confidence score is 45. Very low." And it's guessing it should be a 38 score. And so here are the reasons: "Sender uses a public Gmail inbox. Email appears to be sent from Matt's own Gmail. Novabridge is an unknown company with no verifiable web presence or social proof."

And so yes, it actually goes out. It looks at the website, looks if it's legit, finds reviews of the company, looks up the people at the company. It does this entire research all in a couple minutes and then applies the score. So that's what we see here: "Claims company email and signature but sent from Gmail. No budget deliverables. Series A claim is unverifiable."

And so what I can do from here is just reply back saying "approve" - you got it right. Or I can give it feedback about how to score the email. And I built the rubric over a few days. It is not plug-and-play. I would let it assign a score, figure out how I felt about the score, and then give it feedback about that rubric.

So, here's a quick overview of what that rubric looks like. We have five different main dimensions: fit, clarity, budget, seriousness, company trust, and close likelihood. And they are all weighted with a certain score and then when they are scored, we can take different actions. So, if it is an exceptional company, it escalates to our team, notifies us in Slack, doesn't do anything else. No automated actions, just tell us about it. If it's a high sponsor, it escalates to the team, but it isn't urgent, so we can get to it when we can. For medium, we reply with our qualification questions. For low, we politely decline. And for spam, we just ignore it.

After it scores it, it will actually draft a custom email back to this person. And so that's what you're seeing here. So it says, "Hey, Matthew." And it says, "Hey, Matthew." 'Cause I signed off as Matthew accidentally. "Thanks for reaching out. Check out our sponsorship options here. Let us know if you have any questions at all. Best." And then it's name. Then I simply come in here. When I'm ready, I hit send and it does everything else for me. It's so easy.

And if you want to recreate this yourself, you absolutely can. Here's the prompt for it: "Build a sponsor inbox pipeline. Multi-count email marketing per account config JSON cron every 10 minutes go CLI for Gmail access lazy backfill fetch historical threads for new sender domains quarantine and security."

Then we score it with an editable rubric. This means I am constantly giving it feedback. It is constantly getting better at scoring inbound emails. We apply Gmail labels. We have stage tracking both locally and in HubSpot. We have context-aware reply drafting. So, not just sending a template email. Of course, we use one of the best models for this, Opus 4.6. And we also use the humanizer skill. We do not want it to smell like AI writing.

Then we do sender research. We actually go out, we look up who the company is, who the sponsor is, we find out if it's relevant, we find out if it's legitimate. It does that all for me and then pulls it into our CRM. And of course, we have escalation at the very end.

So, I'm going to drop all the prompts down below in the description. Feel free to get them. And as I mentioned, my entire team uses HubSpot to track our sales. And OpenClaw has access to HubSpot has access to move deals around as it sees fit. So, it'll automatically detect based on our email conversations when a deal has moved stages. Let's say from qualified to negotiations, will send me a message about it, update the team, and then move the deal in HubSpot. All of this happens automatically and HubSpot has been phenomenal and they're also the partner of this video.

---

[END OF TRANSCRIPT]

---
*Transcribed by Amos - AI Development Assistant*
