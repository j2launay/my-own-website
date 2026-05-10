const staticPapers = [
  {
    title: "Impact of Explanation Techniques and Representations on Users' Comprehension and Confidence in Explainable AI",
    year: 2025,
    venue: "CSCW 2025",
    authors: [{ name: "Julien Delaunay" }],
    url: "https://dl.acm.org/doi/10.1145/3711011"
  },
  {
    title: "AILuminate: Introducing v1.0 of the AI Risk and Reliability Benchmark from MLCommons.",
    year: 2025,
    venue: "ArXiv",
    authors: [{ name: "MLCommons et al." }, { name: "Julien Delaunay" }],
    url: "https://arxiv.org/abs/2503.05731"
  },
  {
    title: "Evaluating the Effectiveness of Large Language Models in Converting Clinical Data to FHIR Format.",
    year: 2025,
    venue: "Applied Sciences MDPI",
    authors: [{ name: "Julien Delaunay" }, { name: "Daniel Girbes" }, { name: "Jordi Cusido" }],
    url: "https://www.mdpi.com/2076-3417/15/6/3379"
  },
  {
    title: "Evaluating the Performance of Large Language Models in Predicting Diagnostics for Spanish Clinical Cases in Cardiology.",
    year: 2024,
    venue: "Applied Sciences MDPI",
    authors: [{ name: "Julien Delaunay" }, { name: "Jordi Cusido" }],
    url: "https://www.mdpi.com/2076-3417/15/1/61"
  },
  {
    title: "Does It Make Sense to Explain a Black Box With Another Black Box?",
    year: 2024,
    venue: "Revue TAL",
    authors: [{ name: "Julien Delaunay" }, { name: "Luis Galárraga" }, { name: "Christine Largouët" }],
    url: "https://arxiv.org/abs/2404.14943"
  },
  {
    title: "Explainability for Machine Learning Models: From Data Adaptability to User Perception.",
    year: 2023,
    venue: "PhD Thesis (INRIA)",
    authors: [{ name: "Julien Delaunay" }],
    url: "https://theses.hal.science/tel-04462990v1/document"
  },
  {
    title: "'Honey, Tell Me What's Wrong', Global Explainability of NLP Models through Cooperative Generation",
    year: 2023,
    venue: "TALN 2023",
    authors: [{ name: "Julien Delaunay" }, { name: "Antoine Chaffin" }],
    url: "https://coria-taln-2023.sciencesconf.org/461410/document"
  },
  {
    title: "When Should We Use Linear Explanations?",
    year: 2022,
    venue: "CIKM 2022",
    authors: [{ name: "Julien Delaunay" }, { name: "Luis Galárraga" }, { name: "Christine Largouët" }],
    url: "https://dl.acm.org/doi/abs/10.1145/3511808.3557489"
  },
  {
    title: "s-LIME: Reconciling Locality and Fidelity in Linear Explanations.",
    year: 2022,
    venue: "IDA 2022",
    authors: [{ name: "Romaric Gaudel" }, { name: "Luis Galárraga" }, { name: "Julien Delaunay" }],
    url: "https://www.semanticscholar.org/paper/s-LIME%3A-Reconciling-Locality-and-Fidelity-in-Linear-Gaudel-Gal%C3%A1rraga/42d423d0d82bd6a2428904ff1a715a0f93b1ce30"
  },
  {
    title: "Improving Anchor-based Explanations.",
    year: 2020,
    venue: "CIKM 2020",
    authors: [{ name: "Julien Delaunay" }, { name: "Luis Galárraga" }, { name: "Christine Largouët" }],
    url: "http://luisgalarraga.de/docs/cikm2020.pdf"
  }
];

exports.handler = async function(event, context) {
  const authorId = "2156826131";
  const apiUrl = `https://api.semanticscholar.org/graph/v1/author/${authorId}?fields=papers.title,papers.year,papers.url,papers.venue,papers.authors&limit=50`;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=3600'
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      // Rate-limited or error — serve curated static list
      return { statusCode: 200, headers, body: JSON.stringify({ papers: staticPapers }) };
    }

    const data = await response.json();
    const papers = (data.papers || [])
      .sort((a, b) => (b.year || 0) - (a.year || 0));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ papers: papers.length > 2 ? papers : staticPapers })
    };
  } catch (_) {
    // Network/timeout error — serve curated static list
    return { statusCode: 200, headers, body: JSON.stringify({ papers: staticPapers }) };
  }
};
