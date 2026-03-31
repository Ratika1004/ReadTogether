const axios = require("axios");

const OPEN_LIBRARY = "https://openlibrary.org";
const COVERS       = "https://covers.openlibrary.org/b/id";

// Helper — build a cover URL from a cover_i id
const coverURL = (coverId, size = "M") =>
  coverId ? `${COVERS}/${coverId}-${size}.jpg` : "";

exports.searchBooks = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Query is required" });

    const response = await axios.get(`${OPEN_LIBRARY}/search.json`, {
      params: {
        q,
        limit: 20,
        fields: "key,title,author_name,cover_i,first_publish_year,subject,number_of_pages_median",
      },
      timeout: 8000,
    });

    const books = (response.data.docs || []).map((doc) => ({
      id:            doc.key?.replace("/works/", "") || doc.key,
      title:         doc.title || "Unknown Title",
      authors:       doc.author_name || ["Unknown Author"],
      cover:         coverURL(doc.cover_i),
      publishedYear: doc.first_publish_year || "",
      pageCount:     doc.number_of_pages_median || 0,
      categories:    (doc.subject || []).slice(0, 3),
    }));

    res.json(books);
  } catch (error) {
    console.error("Open Library search error:", error.message);
    res.status(500).json({ message: "Error fetching books. Please try again." });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const workId = req.params.id; // e.g. "OL45883W"

    const [workRes, ratingsRes] = await Promise.allSettled([
      axios.get(`${OPEN_LIBRARY}/works/${workId}.json`, { timeout: 8000 }),
      axios.get(`${OPEN_LIBRARY}/works/${workId}/ratings.json`, { timeout: 8000 }),
    ]);

    if (workRes.status === "rejected") {
      return res.status(404).json({ message: "Book not found" });
    }

    const work = workRes.value.data;

    // Description can be a string or an object with a value field
    const description =
      typeof work.description === "string"
        ? work.description
        : work.description?.value || "";

    // Fetch author names
    let authors = [];
    if (work.authors?.length) {
      const authorFetches = work.authors.slice(0, 3).map((a) =>
        axios
          .get(`${OPEN_LIBRARY}${a.author.key}.json`, { timeout: 5000 })
          .then((r) => r.data.name)
          .catch(() => "Unknown Author")
      );
      authors = await Promise.all(authorFetches);
    }

    const rating =
      ratingsRes.status === "fulfilled"
        ? ratingsRes.value.data?.summary?.average || 0
        : 0;

    res.json({
      id:          workId,
      title:       work.title || "Unknown Title",
      authors,
      description,
      cover:       work.covers?.[0] ? coverURL(work.covers[0]) : "",
      pageCount:   work.number_of_pages || 0,
      publishedYear: work.first_publish_date || "",
      categories:  (work.subjects || []).slice(0, 5),
      rating:      parseFloat(rating.toFixed(1)),
    });
  } catch (error) {
    console.error("Open Library getBookById error:", error.message);
    res.status(500).json({ message: "Error fetching book" });
  }
};