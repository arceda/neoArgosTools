
import os
import pandas as pd 

path_tools = "/home/vicente/biotools"
path_outfile2 = "/home/vicente/projects/neoArgosTools/outfile2/"


# busca las mutacions nonsynonymous de la salda de Annovar
def getNonsynonymousSNVannovar():
    input1=open("annovar_out/annovar.hg38_multianno.txt",'r')
    output1=open("outfile2/gene-nonsynonymous-SNV.txt","w")
    for line in input1:
        ls1=line.strip().split("\t")
        if ls1[8]=='nonsynonymous SNV':
        
            ls2=ls1[9].strip('"').split(',')
            if len(ls2) >=2:
                for i in range(len(ls2)):
                    output1.write(ls2[i]+'\n')
                    #ls3=ls2[i].split(':')
            else:
                output1.write(ls1[9]+'\n')

#  obtiene las mutaciones haciendo match con la bd de uniprot
def nonsynonnymousSNV_in_uniprot():
    input1=open("reference_files/reuniprot.fasta","r")
    input2=open("outfile2/gene-nonsynonymous-SNV.txt","r")
    output1=open("outfile2/match1_proSeq.txt","w")
    dict1={}
    for line in input1:
        ls1=line.strip().split("\t")
        dict1[ls1[0]]=ls1[2]
        dict1[ls1[1]]=ls1[2]
    for line1 in input2:
        ls2=line1.strip().split(":")
        #if dict1.has_key(ls2[0]) or dict1.has_key(ls2[1]):
        if (ls2[0] in dict1.keys()) or (ls2[1] in dict1.keys()):
            output1.write(ls2[0]+"\t"+ls2[4]+"\t"+dict1[ls2[0]]+"\n")
        else:
            pass

# elimina duplicados
def unique_filter(f_in, f_out):
    lines_seen=set()
    outfile = open(f_out,"w")
    for line in open(f_in,"r"):
        if line not in lines_seen:
            outfile.write(line)
            lines_seen.add(line)
    outfile.close()

# filtra por longitud al parecer
def handle_seq():
    input1=open("outfile2/match_proSeq.txt","r")
    output1=open("outfile2/gene-Var-proSeq.txt","w")
    for line in input1:
        ls1=line.strip().split("\t")
        ls2=ls1[1].split('.')
        ls3=ls2[1][0]
        ls4=ls2[1][-1]
        ls5=ls2[1][1:-1]
        ls6=int(ls5)-1
        ls7=list(ls1[2])
        if len(ls1[2]) >= int(ls2[1][1:-1]):  
            if ls7[ls6] == ls2[1][0]:
                ls7[ls6]=ls2[1][-1]
                seq="".join(ls7)
                output1.write(ls1[0]+'\t'+ls1[1]+'\t'+seq+'\n')


# toma los neoantigenos y extrae una parte de ellos. Extrae los AA según un numero en el nombre del gen                
def last_filter():
    input1=open("outfile2/Gene-Varseqence.csv","r")
    output1=open("outfile2/gene-21AA.fasta","w")
    output2=open("outfile2/21-AA.csv","w")
    for line in input1:
        ls=line.strip().split("\t")
        ls1=ls[1].split('.')
        pep=ls1[1][1:-1] # name
        seq=list(ls[2])  # sequence
        
        # extraemos la secuecnia segun el numero de en pep
        pep1=seq[(int(pep)-11):(int(pep)+10)] 
   
        if len(pep1)==21:    
            seq1=''.join(pep1)
            output1.write('>'+ls[0]+':'+ls1[1][0]+ls1[1][-1]+':'+str(11)+"\n"+seq1+'\n') 
            output2.write(ls[0]+':'+ls1[1][0]+ls1[1][-1]+':'+str(11)+"\t"+seq1+'\n') 
        else:
            if int(pep)-11 <= 0:
                pep2=seq[0:(int(pep)+10)] 
                seq2=''.join(pep2)
                num1=pep
                output1.write('>'+ls[0]+':'+ls1[1][0]+ls1[1][-1]+':'+num1+"\n"+seq2+'\n')
                output2.write(ls[0]+':'+ls1[1][0]+ls1[1][-1]+':'+num1+"\t"+seq2+'\n')
            if  int(pep)+10 >= int(len(ls[2])):
                pep3=seq[(int(pep)-11):(int(pep)+1)]
                seq3=''.join(pep3)
                num2=str(11)
                output1.write('>'+ls[0]+':'+ls1[1][0]+ls1[1][-1]+':'+num2+"\n"+seq3+'\n')
                output2.write(ls[0]+':'+ls1[1][0]+ls1[1][-1]+':'+num2+"\t"+seq3+'\n')

def netMHCpan():
    #HLAs = " A*03:01,A*03:01,B*07:02,B*35:03,C*07:02,C*04:01	"
    HLAs = " HLA-A03:01,HLA-A03:01,HLA-B07:02,HLA-B35:03,HLA-C07:02,HLA-C04:01	"
    #cmd = f'{path_tools}/netMHCpan-4.1/netMHCpan -a {HLAs} {path_outfile2}/gene-21AA.fasta  > {path_outfile2}/my.out'
    cmd = f'{path_tools}/netMHCpan-4.1/netMHCpan -a {HLAs} {path_outfile2}/gene-21AA.fasta'
    #print(cmd)
    os.system(cmd)

# leee la salida de netMHCpan4.1 y genra otra en CSV: myresult.csv
def processNetMHCpan_output():
    input1=open("outfile2/my.out","r")
    output1=open("outfile2/my.csv","w")
    for line in input1:
        ls1=line.strip(" ").split('\00')
        ls2=ls1[0].strip(' ').split(' ')
        if "WB" in ls2[-1] or 'SB' in ls2[-1]:
            ls3='\t'.join(ls2[:])
            output1.write(ls3)
    input1.close()
    output1.close()

    
    infile ="outfile2/my.csv"
    outfile = "outfile2/myresult.csv"
    data = pd.read_table(infile, sep="\s+", header=None)
    temp = data.iloc[:, [1, 2,-5,-3,-1]]
    #print data.iloc[:, [-5]]
    temp.to_csv(outfile, sep="	", header=['HLA','Peptide','Gene','%Rank','BindLevel'], index=None)

# junta los resultados de netMHCpan4.1 con eun excel que tiene el nombre de los genes
def join_results():
    input2=open("outfile2/21-AA.csv","r")  
    output=open("outfile2/myresult-noantigen.csv",'w') 
    dict1={}
    for line in input2:
        ls1=line.strip('\n\t').split('\t')
        ls4=ls1[0].split(':')
        input1=open("outfile2/myresult.csv",'r')
        for line1 in input1:
            ls2=line1.strip().split('\t')
            if ls2[1] in ls1[1]:
                ls3=ls1[1].index(ls2[1])+1
                output.write(line1. strip()+'\t'+ls1[1]+'\t'+str(ls3)+'\t'+ls4[2]+'\n')               
            #print ls1[1]

# filtra los peptido reconocidos por netMHCpan segun cumpla algunos valores en el nombre del gen
def filter_netMHCpan():
    input1=open("outfile2/myresult-noantigen.csv",'r')             
    output1=open("outfile2/candid1-noantigen.txt",'w')             
    for line in input1:
        ls1=line.strip().split('\t')
        ls3=ls1[2].split('_')
        if float(ls1[6]) <= float(ls1[7]):
            if float(ls1[6])+float(len(ls1[1]))-1 >= float(ls1[7]):
                ls2=float(ls1[7])-float(ls1[6])+1
                #print ls2
                output1.write(ls1[0]+'\t'+ls3[0]+'\t'+ls1[1]+'\t'+ls1[3]+'\t'+ls1[4]+'\t'+ls3[1]+'\t'+str(ls2)+'\n')


#getNonsynonymousSNVannovar()
#nonsynonnymousSNV_in_uniprot()
#unique_filter("outfile2/match1_proSeq.txt", "outfile2/match_proSeq.txt")
#handle_seq()
#unique_filter("outfile2/gene-Var-proSeq.txt", "outfile2/Gene-Varseqence.csv")
#last_filter()
netMHCpan() # es el que mas demora 30 min 
#processNetMHCpan_output()
#join_results()
#filter_netMHCpan()
#unique_filter("outfile2/candid1-noantigen.txt", "outfile2/candid-noantigen.txt")