import { useState } from "react";

import Header from './Header'
import Footer from './Footer'
import '../css/news.css'

function News() {
    return(
        <>
            <Header/>
                <FeaturedNews/>
                <NewsList/>
            <Footer/>
        </>
    )
}

function FeaturedNews() {
    return(
        <>
            <div className="featured-news">
                <h2 className="featured-title">FEATURED</h2>
                <div className="featured-news-body">
                    <div className="big-featured">
                        <div className="big-featured-image">
                            <img alt="/"/>
                        </div>
                        <h2>News Title</h2>
                        <p className="big-featured-news-author">News Author</p>
                        <p className="big-featured-news-date">Date</p>
                        <p className="big-featured-news-desc">News Description blah blah blah</p>
                    </div>
                    <div className="other-featured">
                        <div className="featured-card">
                            <div className="featured-news-image">
                                <img alt="/"/>
                            </div>

                            <h2>News Title</h2>
                            <p className="featured-news-author">News Author</p>
                            <p className="featured-news-date">Date</p>
                        </div>
                        <div className="featured-card">
                            <div className="featured-news-image">
                                <img alt="/"/>
                            </div>

                            <h2>News Title</h2>
                            <p className="featured-news-author">News Author</p>
                            <p className="featured-news-date">Date</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

function NewsList() {
    const newsData = [
      { title: "News 1", author: "Author 1", date: "2025-10-01", description: "Description 1" },
      { title: "News 2", author: "Author 2", date: "2025-10-02", description: "Description 2" },
      { title: "News 3", author: "Author 3", date: "2025-10-03", description: "Description 3" },
      { title: "News 4", author: "Author 4", date: "2025-10-04", description: "Description 4" },
      { title: "News 5", author: "Author 5", date: "2025-10-05", description: "Description 5" },
      { title: "News 6", author: "Author 6", date: "2025-10-06", description: "Description 6" },
    ];
  
    const [currentPage, setCurrentPage] = useState(1);
    const cardsPerPage = 4;
  
    const indexOfLastCard = currentPage * cardsPerPage;
    const indexOfFirstCard = indexOfLastCard - cardsPerPage;
    const currentCards = newsData.slice(indexOfFirstCard, indexOfLastCard);
  
    const totalPages = Math.ceil(newsData.length / cardsPerPage);
  
    return (
      <div className="news-list">
        <h2 className="news-list-title">LATEST NEWS</h2>
        <p className="news-list-description">Looking for the latest news about the current events and news from evacuation centers?</p>
        <div className="news-list-container">
          <input type="text" placeholder="Search for the latest news" />
          <div className="news-list-root">
            {currentCards.map((item, idx) => (
              <div className="news-card" key={idx}>
                <div className="news-card-image">
                  <img alt={item.title} />
                </div>
                <div className="news-card-text">
                  <h1>{item.title}</h1>
                  <h2>{item.author}</h2>
                  <p>{item.date}</p>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
  
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Prev
            </button>
  
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={currentPage === i + 1 ? "active" : ""}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
  
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
}

export default News