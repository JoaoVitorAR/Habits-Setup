import dayjs from "dayjs";
import { FastifyInstance } from "fastify";
import { z } from 'zod'
import { prisma } from "./lib/prisma";

export async function appRoutes(app: FastifyInstance) {

    app.post('/habits', async (request) => {
        const createHabitBody = z.object({
            //verifica se os dados estao corretos
            title: z.string(),
            weekDays: z.array(z.number().
                min(0).max(6)
            )
        })
        
        const { title, weekDays } = createHabitBody.parse(request.body)
        const today = dayjs().startOf('day').toDate()

        await prisma.habit.create({
            data: {
                title,
                created_at: today,
                weekDays:{
                    create: weekDays.map( weekDays => {
                        return {
                            week_day: weekDays,
                        }
                    })
                }
            }
        })
    });

    app.get('/day', async (request) =>{
        const getDayParams = z.object({
            //busca qual dia/mes/ano você escolheu
            date: z.coerce.date()
        })

        const { date } = getDayParams.parse(request.query)
        const parsedDate = dayjs(date).startOf('day')
        const weekDay = parsedDate.get('day')

        //retorna todos os hábitos possiveis
        const possibleHabits = await prisma.habit.findMany({
            where: {
                created_at:{
                    lte: date,
                },
                weekDays: {
                    some: {
                        week_day: weekDay
                    }
                }
            }
        });

        //hábitos que ja foram completados
        const day = await prisma.day.findUnique({
            where:{
                date: parsedDate.toDate(),
            },
            include: {
                dayHabits: true,
            }
        })

        const completedHabits = day?.dayHabits.map( dayHabit => {
            return dayHabit.habit_id
        })

        return {
            possibleHabits,
            completedHabits
        }
    });
}