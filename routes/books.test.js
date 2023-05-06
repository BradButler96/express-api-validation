process.env.NODE_ENV = "test"
const request = require("supertest");
const app = require("../app");
const db = require("../db");
const Book = require("../models/book");

let testBook

beforeEach(async () => {
    await db.query("DELETE FROM books");
    testBook = await Book.create({
            "isbn": "0547572484",
            "amazon_url": "https://www.amazon.com/Man-High-Castle-Philip-Dick/dp/0547572484",
            "author": "Phillip K. Dick",
            "language": "english",
            "pages": 288,
            "publisher": "Mariner Books Classics; Reissue edition",
            "title": "The Man In The High Castle",
            "year": 2012
    });
});

afterAll(async () => {
    await db.end();
});
  
describe("GET /books", () => {
    test("get all books", async () => {
        const response = await request(app).get(`/books`);
        expect(response.body.books.length).toEqual(1)
    });
});

describe("GET /books/:id", () => {
    test("get book by id", async () => {
        const response = await request(app).get(`/books/${testBook.isbn}`)
        expect(response.body.book.isbn).toEqual(testBook.isbn)
    });

    test("fail to get book when id is invalid", async () => {
        const response = await request(app).get(`/books/1`)
        expect(response.statusCode).toBe(404);
    });
});

describe("POST /books", () => {
    test("add book to db", async () => {
        let newBook = {
            isbn: "0345404475",
            amazon_url: "https://www.amazon.com/Androids-Dream-Electric-Sheep-inspiration/dp/0345404475",
            author: "Phillip K. Dick",
            language: "english",
            pages: 240,
            publisher: "Random House Worlds",
            title: "Do Androids Dream of Electric Sheep?",
            year: 1996 
        }
        const response = await request(app).post(`/books`).send(newBook);
        expect(response.statusCode).toBe(201);
        expect(response.body.book.isbn).toEqual(newBook.isbn)
    });

    test("fail to add book when data is invalid", async () => {
        const response = await request(app).post(`/books`).send({title: "title"});
        expect(response.statusCode).toBe(400);
    });
});

describe("PUT /books/:isbn", () => {
    test("update book by isbn", async () => {
        const updatedData = {
            "amazon_url": "https://www.amazon.com/Man-High-Castle-Philip-Dick/dp/0547572484",
            "author": "Phillip K. Dick",
            "language": "english",
            "pages": 288,
            "publisher": "Mariner Books Classics; Reissue edition",
            "title": "The Man In The High Castle",
            "year": 1962
        }

        const response = await request(app).put(`/books/${testBook.isbn}`).send(updatedData);
        expect(response.body.book.year).toEqual(1962);
    });

    test("fail to update book when data is invalid (pages is string not integer)", async () => {
        const failData = {
            "amazon_url": "https://www.amazon.com/Man-High-Castle-Philip-Dick/dp/0547572484",
            "author": "Phillip K. Dick",
            "language": "english",
            "pages": "288",
            "title": "The Man In The High Castle",
            "publisher": "Mariner Books Classics; Reissue edition",
            "year": 1962
        }

        const response = await request(app).put(`/books`).send(failData);
        expect(response.statusCode).toBe(404);
    });
});

describe("DELETE /books/:isbn", () => {
    test("delete book by isbn", async () => {
        const response = await request(app).delete(`/books/${testBook.isbn}`)
        expect(response.body).toEqual({message: "Book deleted"});
    });
    
    test("fail to delete book when id is invalid", async () => {
        const response = await request(app).delete(`/books/1`);
        expect(response.statusCode).toBe(404);
    });
});
