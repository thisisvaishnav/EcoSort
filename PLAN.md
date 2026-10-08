# EcoSort Heroes: Full Plan

"EcoSort Heroes" is a placeholder name. The tagline is **"Sort the waste. Power the town."**

## Part 1: Game plan

### 1.1 Goal and audience
- **Players:** children aged 5 to 10.
- **Goal:** the child learns which waste goes in which bin, and why.
- **Session length:** 5 to 8 minutes for each level.
- **Platform:** a web browser on a PC, tablet, or phone. No install is necessary.

### 1.2 Screen flow
1. Landing page
2. Nickname and avatar (guest mode, or login)
3. Level map
4. Level intro (the mascot teaches the new bins)
5. Gameplay (pick up, throw, sort)
6. Level end (stars, quiz, Eco-pedia card, energy result)
7. Progress report for the teacher or parent

### 1.3 Core loop
1. An item appears on the table.
2. The child picks up the item with a click, drag, or touch.
3. The child throws the item at a bin.
4. The game checks the answer.
5. The game shows feedback with the reason.
6. The energy meter and the scene change.
7. The next item appears. The spawner picks it by probability.

### 1.4 Levels

| Level | Place | Bins | Learning goal | Energy link |
|---|---|---|---|---|
| 1 | Home kitchen | Wet, Dry | Food waste is not the same as paper and plastic | Wet waste makes biogas |
| 2 | Living room | Wet, Dry, Hazardous | Some waste is dangerous | Batteries leak chemicals |
| 3 | School | Paper, Plastic, Metal/Glass, Wet | Dry waste has types | Recycling saves energy |
| 4 | Park and river | Add E-waste | Waste harms animals and water | Clean river, clean power |
| 5 | Recycling plant | Add Reuse | Reduce and reuse come first | Show the full cycle |
| Bonus | Conveyor belt | All bins | Speed and memory test | Town gets full power |

### 1.5 Game systems

| System | How it works |
|---|---|
| **Spawner** | Weighted probability. Missed items appear more often. No item appears twice in a row. Each set of 6 items has at least one item for each open bin. |
| **Scoring** | Correct throw: +10 points. Streak of 3 or more: bonus. Wrong throw: 0 points, no penalty. |
| **Stars** | 3 stars for 90% accuracy or more. 2 stars for 70% or more. 1 star for completion. |
| **Feedback** | The mascot speaks one short sentence with the reason. Text and voice are both present. |
| **Energy meter** | Each correct throw fills the meter. The town lights turn on as the meter fills. |
| **Eco-pedia** | Each correct item unlocks a card: picture, bin, fun fact. |
| **Quiz** | 3 picture questions at the end of each level. |
| **Report** | Accuracy by category, and the items that need practice. |

### 1.6 Item data (one JSON entry)
```json
{
  "id": "battery_aa",
  "name": "Old battery",
  "bin": "hazardous",
  "baseWeight": 0.12,
  "unlockLevel": 2,
  "fact": "A battery has chemicals. Put it in the red bin.",
  "model": "battery.glb"
}
```

### 1.7 Accessibility rules
- Show each bin with color, icon, label, and shape.
- Add voice for each text message.
- Make all controls work with touch.
- Add a sound on/off button and a slow mode.

### 1.8 Tech
Three.js (3D), Rapier or Cannon.js (throw physics), Vite (build tool), free low-poly models from Kenney or Quaternius.

---

## Part 2: Landing page

Rules used for the copy: short sentences, one idea in each sentence, active voice, simple words. This follows ASD-STE100 style. Replace the bracketed items with true local data and add a source for each number.

### Section 1: Navigation bar
**Logo** | How it works | Bins | Levels | For teachers | **[Play now]**

### Section 2: Hero (first screen)
**Heading:** Sort the Waste. Power the Town.
**Sub-heading:** Play a 3D game in your browser. Learn which waste goes in which bin.
**Buttons:** [Play now, it is free] [Watch the 60-second demo]
**Picture:** A 3D scene with the mascot, four bins, and a town with lights on.

### Section 3: The problem
**Heading:** Waste is a big problem
- People throw different types of waste in one bin.
- Mixed waste goes to the landfill.
- Wet waste in a landfill makes methane gas.
- Children who learn to sort early keep the habit.
- [Insert one verified local waste number and its source.]

### Section 4: How it works
**Heading:** Three steps. One clean town.
1. **Pick up.** Take an item from the table.
2. **Throw.** Throw the item into a bin.
3. **Learn.** The mascot tells you why.

### Section 5: Meet the bins
**Heading:** Know your bins
- **Green bin:** Food and leaves go here. They become compost.
- **Blue bin:** Clean paper, plastic, and cans go here. They become new products.
- **Red bin:** Batteries and medicine go here. They are dangerous.
- **Orange bin:** Old phones and chargers go here. They have metal that people can use again.
- **Reuse box:** Jars and clothes go here. Use them again.

(Match the colors to your local rules.)

### Section 6: Energy
**Heading:** Waste can make power
- Wet waste goes to a biogas plant.
- The plant makes gas for cooking and light.
- Every correct throw fills the energy meter.
- When the meter is full, the whole town has light.
- Recycling an item uses less energy than making a new item.

### Section 7: A game that learns about you
**Heading:** The game finds what you need to practice
- The game counts each wrong answer.
- The game shows these items more often.
- The game shows fewer items that you already know.
- Each child gets a different game.

### Section 8: Levels preview
**Heading:** Five places. One big mission.
Show five small pictures: Home, School, Park, River, Recycling plant. Add one line for each place.

### Section 9: Meet the mascot
**Heading:** Meet Eco, your guide
- Eco talks to you in a clear voice.
- Eco does not shout when you make a mistake.
- Eco gives a reason for each answer.

### Section 10: For teachers and parents
**Heading:** See what the child learns
- Use the game in class or at home.
- Read a simple report after each level.
- See the accuracy for each type of waste.
- See which items need more practice.
- The game does not ask for a real name. It uses a nickname.

### Section 11: Results
**Heading:** Does it work?
- Show your pre-test and post-test numbers: "Before the game: [X]% correct. After the game: [Y]% correct."
- Do the test with a small group first. Show the true numbers only.

### Section 12: FAQ
- **Which devices work?** A PC, a tablet, or a phone with a browser.
- **Is it free?** Yes.
- **Which ages?** 5 to 10 years.
- **Does it need an account?** No. A child can play as a guest.

### Section 13: Final call to action and footer
**Heading:** Ready to be an Eco Hero?
**Button:** [Play now]
**Footer:** Team name | Contact | "Built on AWS" | Hackathon name

---

## Part 3: Where you use AWS

The prize rule says you must use one AWS open source tool or deploy on AWS. Do both for the strongest project. Check the current free tier and credit terms in the AWS console before you start.

| Step | What you do | AWS tool | Why |
|---|---|---|---|
| 1. Local build | Test the backend on your PC | **SAM CLI**, LocalStack (open source) | No cost. No account needed. This alone meets the open source rule. |
| 2. Host the game | Publish the Three.js game and landing page | **AWS Amplify Hosting** (connect your GitHub repo) | You get a public URL. Each code push deploys again. |
| 3. Store assets | Keep 3D models, sounds, and images | **S3**, with **CloudFront** in front | Fast loading for large files. |
| 4. Save progress | Save scores, stars, Eco-pedia, and item errors | **API Gateway + Lambda + DynamoDB** | No server to manage. Low cost. |
| 5. Login | Teacher and student accounts, plus guest mode | **Cognito** | Safe login. You do not write the login code. |
| 6. Voice | Create the mascot voice for each message | **Amazon Polly** | Children who cannot read can still learn. Generate the audio files once and keep them in S3. |
| 7. AI mascot (optional) | A child asks Eco a question, such as "Can I recycle a pizza box?" | **Strands Agents SDK** (open source) with **Amazon Bedrock** through Lambda | Adds an AI feature. Add safety limits and keep the answers short and child-safe. |
| 8. Teacher report | Read data from DynamoDB and show charts | **Lambda + API Gateway** | Proves that the game measures learning. |
| 9. Monitor | Check errors and traffic | **CloudWatch** | Useful during the live demo. |
| 10. Domain (optional) | Use a short custom name | **Route 53** | Looks more professional. |

### Data flow
```
Child's browser (Three.js game)
   -> Amplify Hosting / CloudFront (game files)
   -> API Gateway -> Lambda -> DynamoDB (progress, scores)
   -> Cognito (login)
   -> Polly audio in S3 (voice)
   -> Lambda -> Bedrock (optional "Ask Eco")
```

### Minimum AWS plan if time is short
1. Deploy the game with **Amplify Hosting**. This takes about 30 minutes.
2. Add **DynamoDB + Lambda + API Gateway** for progress and the teacher report.
3. Add **Polly** voice files in **S3**.
4. Add **Cognito** and the AI mascot only if time remains.

### Child privacy
Store only a nickname, the score, and the item results. Do not store a real name, a photo, or a location.

---

## Part 4: Timeline

| Phase | Work | AWS step |
|---|---|---|
| 1 | Three.js scene, one bin, throw physics | Step 1 (local) |
| 2 | Four bins, 15 items, spawner, scoring | None |
| 3 | Feedback, mascot, energy meter, levels 1 to 3 | Step 3 (assets) |
| 4 | Landing page and first deployment | Step 2 (Amplify) |
| 5 | Save progress and teacher report | Steps 4, 5, 8 |
| 6 | Polly voice, Eco-pedia, quiz | Step 6 |
| 7 | Pre-test and post-test with a small group | Step 9 (monitor) |
| 8 | Demo video, slides, final test of the live URL | All steps |

## Part 5: ASD-STE100 checklist for all your text

- Use one sentence for one idea.
- Keep sentences to 20 words or fewer for instructions, and 25 or fewer for descriptions.
- Use active voice: "Throw the bottle in the blue bin."
- Use simple present tense. Avoid long verb chains.
- Use the same word for the same thing. Do not change "bin" to "container" to "can".
- Keep the articles (a, an, the). Do not use slang or idioms.
- Write "Do not" for warnings.
- Avoid contractions.

For the in-game child text, make the sentences even shorter. Aim for 8 words or fewer.

For the presentation, say what AWS tools you used, show the live URL, and show the CloudWatch or DynamoDB screen as proof.
