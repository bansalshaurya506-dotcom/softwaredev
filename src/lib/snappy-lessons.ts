export type Concept = {
  id: string
  label: string
  x: number
  y: number
  summary: string
  detail: string
  question: string
}
export type Lesson = {
  id: string
  category: string
  title: string
  tagline: string
  accent: string
  duration: string
  level: string
  concepts: Concept[]
}

export const LESSONS: Lesson[] = [
  {
    id: "cell", category: "BIOLOGY", title: "Inside a living cell",
    tagline: "Explore the tiny structures keeping life running.",
    accent: "#90FFCA", duration: "4 min", level: "Beginner",
    concepts: [
      { id:"nucleus", label:"Nucleus", x:50, y:42,
        summary:"The cell's control center.",
        detail:"The nucleus contains most of a eukaryotic cell's DNA. It helps regulate which proteins the cell makes, influencing its growth and activity.",
        question:"Why might a cell need to protect its DNA?" },
      { id:"mitochondria", label:"Mitochondrion", x:29, y:65,
        summary:"Releases usable energy.",
        detail:"Mitochondria convert energy from food molecules into ATP during cellular respiration. Cells use ATP to power many activities.",
        question:"Which cells might need a lot of mitochondria?" },
      { id:"membrane", label:"Cell membrane", x:79, y:63,
        summary:"Controls what enters and exits.",
        detail:"The cell membrane is a selectively permeable phospholipid bilayer. It helps maintain stable conditions by regulating the movement of substances.",
        question:"What could happen if the membrane let everything through?" },
    ]
  },
  {
    id:"space", category:"ASTRONOMY", title:"Our solar neighborhood",
    tagline:"Point at a celestial body to discover its role.",
    accent:"#A8BEFF", duration:"5 min", level:"Beginner",
    concepts:[
      { id:"sun", label:"The Sun", x:26, y:48,
        summary:"The star at the center of our solar system.",
        detail:"The Sun is a star powered by nuclear fusion. Its gravity keeps planets in orbit and its light supplies most of Earth's energy.",
        question:"What would Earth be like without sunlight?" },
      { id:"earth", label:"Earth", x:61, y:55,
        summary:"Our home planet.",
        detail:"Earth orbits the Sun approximately once every 365.25 days. Its atmosphere and liquid water help make it suitable for life.",
        question:"What causes Earth's seasons?" },
      { id:"moon", label:"The Moon", x:79, y:39,
        summary:"Earth's natural satellite.",
        detail:"The Moon orbits Earth. Its gravity, along with the Sun's, contributes to ocean tides; its changing appearance produces lunar phases.",
        question:"Why does the Moon appear to change shape?" },
    ]
  },
  {
    id:"forces", category:"PHYSICS", title:"Forces in motion",
    tagline:"Unpack the invisible forces around everyday objects.",
    accent:"#FFCE8B", duration:"6 min", level:"Beginner",
    concepts:[
      { id:"gravity", label:"Gravity", x:50, y:82,
        summary:"Pulls objects toward Earth.",
        detail:"Gravity gives objects weight and accelerates them downward near Earth's surface at about 9.8 m/s², ignoring air resistance.",
        question:"Do heavy objects fall faster in a vacuum?" },
      { id:"normal", label:"Normal force", x:51, y:27,
        summary:"The support force from a surface.",
        detail:"A surface pushes perpendicular to itself on an object in contact with it. This is the normal force, which can balance weight.",
        question:"Why doesn't a book fall through a table?" },
      { id:"friction", label:"Friction", x:24, y:62,
        summary:"Resists sliding motion.",
        detail:"Friction acts along surfaces in contact, opposing relative motion or the tendency to slide. Its strength depends on the surfaces and the normal force.",
        question:"Why is walking difficult on ice?" },
    ]
  }
]
export const findLesson = (id: string) => LESSONS.find((lesson) => lesson.id === id) || LESSONS[0]
