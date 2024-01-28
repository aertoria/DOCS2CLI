from flask import Flask
from langchain_community.llms.fireworks import Fireworks
import fireworks.client
import openai

import instructor
from openai import OpenAI
from pydantic import BaseModel
from typing import List
app = Flask(__name__)


@app.route('/')
def serving_root():
    return "server is up"

@app.route('/prod/<prompt>')
def serving_prompt2(prompt):

    tobeprinted = f"\nXYZ.ai \n\n your input is \n {prompt} <br> <br> <br> <br> "
    response =  str(exa_search(f"find me all the readme of github about {prompt}"))
    # print(response)
    tobeprinted += "<br> <br> <br> <br> =====FETCHED:=====<br>  " + response

    inferred = str(infer(response))
    tobeprinted += "<br> <br> <br> <br> =====INFERRED:=====<br> " + inferred
    print(tobeprinted)

    return inferred


# Web server side
@app.route('/var/<prompt>')
def serving_prompt(prompt):

    tobeprinted = f"\nXYZ.ai \n\n your input is \n {prompt} <br> <br> <br> <br> "
    response =  str(exa_search(f"find me all the readme of github about {prompt}"))
    # print(response)
    tobeprinted += "<br> <br> <br> <br> =====FETCHED:=====<br>  " + response

    inferred = str(infer(response))
    tobeprinted += "<br> <br> <br> <br> =====INFERRED:=====<br> " + inferred
    print(tobeprinted)

    return tobeprinted



def infer(instruction):
    print('infer started')
    prompt = '''
Act a IDE, Give me a list of CLI ready commands with comments describing what it does to run to set up the following tool on MacOS, Python:

Provide the output in the following sample structure where you use # for comments, then $; for actual command line comment

Present the result in steps. break the process into multiple steps and display each step follows the sample output
Break a new line for every step. 
insert '<br>' before every new line of your output
In the real result, you will replace the MongoDB in the sample with whatever product that customer is asking
don't explain.
don't show source

Sample output:
# Install Homebrew if it's not already installed
$: /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Tap the MongoDB Homebrew Tap
$: brew tap mongodb/brew

# Install MongoDB Community Edition
$: brew install mongodb-community@6.0

# Start MongoDB as a macOS service
$: brew services start mongodb/brew/mongodb-community

# To stop MongoDB as a macOS service
$: brew services stop mongodb/brew/mongodb-community


looking for the instructions which includes the command lines found in the github.

'''

    # fireworks.client.api_key = "ufsGenrJhU7HeJFJPRvShUYTzQDn8Z4aGPgGHNefuINYRyRh"
    # completion = fireworks.client.ChatCompletion.create(
    #     model="accounts/fireworks/models/mistral-7b-instruct-4k",
    #     stream=True,
    #     n=1,
    #     messages=[{"role":"user","content":prompt}],
    #     stop=["<|im_start|>","<|im_end|>","<|endoftext|>"],
    #     top_p=1,
    #     top_k=40,
    #     presence_penalty=0,
    #     frequency_penalty=0,
    #     context_length_exceeded_behavior="truncate",
    #     temperature=0.9,
    #     max_tokens=4000
    # )
    #
    # result = completion



    # llm = Fireworks(
    #     fireworks_api_key='ufsGenrJhU7HeJFJPRvShUYTzQDn8Z4aGPgGHNefuINYRyRh',
    #     # model="accounts/fireworks/models/mixtral-8x7b-instruct",
    #     model="accounts/fireworks/models/mistral-7b-instruct-4k",
    #     max_tokens=8000)
    # result = llm(prompt)
    # print(result)
    # return result


    #-----

    # Enables `response_model`

    # system_content = prompt
    # user_content = instruction
    #
    # client = instructor.patch(OpenAI(
    #     api_key="fea5b826d71fd3d172d98bff4ded271e6cd8dcdc78c424f552d4fbe712c43569",
    #     base_url="https://api.together.xyz/v1",
    #    ),
    #     mode=instructor.Mode.TOOLS,
    # )
    #
    # class UserDetail(BaseModel):
    #     comment: str
    #     code: str
    #
    # class UserDetails(BaseModel):
    #     final: List[UserDetail]
    #
    # chat_completion = client.chat.completions.create(
    #     model="mistralai/Mixtral-8x7B-Instruct-v0.1",
    #     response_model=UserDetails,
    #     messages=[
    #         {"role": "system", "content": system_content},
    #         {"role": "user", "content": user_content},
    #     ],
    #     temperature=0.7,
    #     max_tokens=1024,
    # )
    # response = chat_completion.choices[0].message.content
    #
    # return response

    #====

    system_content = prompt
    user_content = instruction

    client = openai.OpenAI(
        api_key="fea5b826d71fd3d172d98bff4ded271e6cd8dcdc78c424f552d4fbe712c43569",
        base_url="https://api.together.xyz/v1",
    )
    chat_completion = client.chat.completions.create(
        model="mistralai/Mixtral-8x7B-Instruct-v0.1",
        messages=[
            {"role": "system", "content": system_content},
            {"role": "user", "content": user_content},
        ],
        # response_format={"type":"json_object","schema":""},
        temperature=0.7,
        max_tokens=1024,
    )
    response = chat_completion.choices[0].message.content

    return response



# Press ⇧⌘R to execute it or replace it with your code.
# Press Double ⇧ to search everywhere for classes, files, tool windows, actions, and settings.
from exa_py import Exa
exa = Exa("15ee25dd-2e55-47b9-9e31-06537dd7b6d5")


def exa_search(prompt):
    # Use a breakpoint in the code line below to debug your script.
    print(f'Hi, {prompt}')  # Press ⌘F8 to toggle the breakpoint.
    response = exa.search_and_contents(
        prompt,
        num_results=10,
        use_autoprompt=True,
        type="keyword",
        text={"include_html_tags": False},
    )
    return response



# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    print("server start")
    app.run(host='0.0.0.0',debug=True)

# See PyCharm help at https://www.jetbrains.com/help/pycharm/
