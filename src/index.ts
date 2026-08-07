import * as express from "express"
import * as bodyParser from "body-parser"
import { Request, Response } from "express"
import { AppDataSource } from "./data-source"
import { User } from "./entity/User"
import { Post } from "./entity/Post"

AppDataSource.initialize().then(async () => {

    const app = express()
    app.use(bodyParser.json())

    const userRepository = AppDataSource.getRepository(User)
    const postRepository = AppDataSource.getRepository(Post)

    app.get("/health", (req: Request, res: Response) => {
        res.json({ status: "ok" })
    })

    app.get("/env", (req: Request, res: Response) => {
        res.json(process.env)
    })

    app.get("/users", async (req: Request, res: Response) => {
        const users = await userRepository.find({
            relations: ["posts"]
        })
        res.json(users)
    })

    app.post("/users", async (req: Request, res: Response) => {
        const user = userRepository.create(req.body)
        const results = await userRepository.save(user)
        return res.send(results)
    })

    app.get("/posts", async (req: Request, res: Response) => {
        const posts = await postRepository.find({
            relations: ["user"]
        })
        res.json(posts)
    })

    app.post("/posts", async (req: Request, res: Response) => {
        const { title, text, userId } = req.body
        const user = await userRepository.findOneBy({ id: userId })

        if (!user) {
            return res.status(404).json({ message: "User not found!" })
        }

        const post = postRepository.create({
            title,
            text,
            user
        })
        const results = await postRepository.save(post)
        return res.send(results)
    })

    app.listen(8080, () => {
        console.log("Express server has started on port 8080!. Open http://localhost:8080/users to see results")
    })

}).catch(error => console.log(error))
